import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Project from "./models/Project.js";

let io = null;

// Map<projectId, Map<socketId, { userId, name, email, avatar }>>
const projectActiveUsers = new Map();

// Map<userId, Set<socketId>> — to find all sockets for a given userId
const userSockets = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://togglenest-lake.vercel.app",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // JWT Authentication Middleware for Sockets
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const user = await User.findById(decoded.id).select("name username email avatar");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name || user.username || "User",
        email: user.email,
        avatar: user.avatar || "",
      };

      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      return next(new Error("Authentication error: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Track user → sockets mapping
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join personal user room for direct notifications
    socket.join(`user:${userId}`);

    // ── Join Project Room (with membership check) ─────────────────────────────
    socket.on("project:join", async ({ projectId }) => {
      if (!projectId) return;

      try {
        const project = await Project.findById(projectId);
        if (!project || !project.isAuthorized(userId)) {
          // Reject unauthorized room join silently on server, notify client
          socket.emit("project:access_denied", {
            projectId,
            message: "You do not have access to this project",
          });
          return;
        }

        const roomName = `project:${projectId}`;
        socket.join(roomName);
        socket.currentProjectId = projectId; // track for disconnect cleanup

        if (!projectActiveUsers.has(projectId)) {
          projectActiveUsers.set(projectId, new Map());
        }

        projectActiveUsers.get(projectId).set(socket.id, {
          userId,
          name: socket.user.name,
          email: socket.user.email,
          avatar: socket.user.avatar,
        });

        broadcastPresence(projectId);
      } catch (err) {
        console.error("project:join error:", err.message);
      }
    });

    // ── Leave Project Room ────────────────────────────────────────────────────
    socket.on("project:leave", ({ projectId }) => {
      if (!projectId) return;
      leaveProjectRoom(socket, projectId);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      // Remove from user sockets map
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }

      // Remove from all project presence maps
      projectActiveUsers.forEach((socketsMap, projectId) => {
        if (socketsMap.has(socket.id)) {
          socketsMap.delete(socket.id);
          if (socketsMap.size === 0) {
            projectActiveUsers.delete(projectId);
          } else {
            broadcastPresence(projectId);
          }
        }
      });
    });
  });

  return io;
};

// ─── Internal: remove socket from a project room ─────────────────────────────
const leaveProjectRoom = (socket, projectId) => {
  const roomName = `project:${projectId}`;
  socket.leave(roomName);

  if (projectActiveUsers.has(projectId)) {
    projectActiveUsers.get(projectId).delete(socket.id);
    if (projectActiveUsers.get(projectId).size === 0) {
      projectActiveUsers.delete(projectId);
    } else {
      broadcastPresence(projectId);
    }
  }
};

// ─── Broadcast distinct active users in a project ────────────────────────────
const broadcastPresence = (projectId) => {
  if (!io) return;

  const socketsMap = projectActiveUsers.get(projectId);
  const activeList = [];

  if (socketsMap) {
    const seenUsers = new Set();
    socketsMap.forEach((u) => {
      if (!seenUsers.has(u.userId)) {
        seenUsers.add(u.userId);
        activeList.push(u);
      }
    });
  }

  io.to(`project:${projectId}`).emit("project:presence", {
    projectId,
    users: activeList,
  });
};

// ─── Emit to all sockets in a project room ───────────────────────────────────
export const emitToProject = (projectId, event, data, senderSocketId = null) => {
  if (!io || !projectId) return;

  const roomName = `project:${projectId.toString()}`;
  if (senderSocketId) {
    io.to(roomName).except(senderSocketId).emit(event, data);
  } else {
    io.to(roomName).emit(event, data);
  }
};

// ─── Emit to a specific user (all their sockets) ─────────────────────────────
export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
};

/**
 * Kick a specific user from a project room.
 * Called when the owner removes a member.
 * Sends a "project:kicked" event to the removed user's sockets,
 * then forcibly removes them from the socket room.
 */
export const kickUserFromProjectRoom = (projectId, userId) => {
  if (!io) return;

  const roomName = `project:${projectId}`;
  const socketsForUser = userSockets.get(userId.toString());

  if (!socketsForUser || socketsForUser.size === 0) return;

  socketsForUser.forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) return;

    // Notify the client they've been removed
    socket.emit("project:kicked", {
      projectId,
      message: "You have been removed from this project",
    });

    // Remove from socket room
    socket.leave(roomName);

    // Remove from presence map
    if (projectActiveUsers.has(projectId)) {
      projectActiveUsers.get(projectId).delete(socketId);
    }
  });

  // Clean up empty presence maps and re-broadcast
  if (projectActiveUsers.has(projectId)) {
    if (projectActiveUsers.get(projectId).size === 0) {
      projectActiveUsers.delete(projectId);
    } else {
      broadcastPresence(projectId);
    }
  }
};

export const getIO = () => io;
