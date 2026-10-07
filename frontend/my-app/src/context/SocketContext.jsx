import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  // Callbacks registered by Board when it mounts — allows socket context
  // to notify the board about kick/access events without prop drilling
  const kickHandlerRef = useRef(null);
  const accessDeniedHandlerRef = useRef(null);

  const socketRef = useRef(null);
  const currentProjectRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setActiveUsers([]);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);

      // If user was in a project room before reconnecting, rejoin it
      if (currentProjectRef.current) {
        socket.emit("project:join", { projectId: currentProjectRef.current });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection warning:", err.message);
      setIsConnected(false);
    });

    socket.on("project:presence", ({ projectId, users }) => {
      if (currentProjectRef.current === projectId) {
        setActiveUsers(users || []);
      }
    });

    // Server tells client they've been kicked from a project room
    socket.on("project:kicked", ({ projectId, message }) => {
      if (currentProjectRef.current === projectId) {
        currentProjectRef.current = null;
        setActiveUsers([]);
      }
      if (kickHandlerRef.current) {
        kickHandlerRef.current({ projectId, message });
      }
    });

    // Server rejected the project:join attempt (unauthorized)
    socket.on("project:access_denied", ({ projectId, message }) => {
      if (accessDeniedHandlerRef.current) {
        accessDeniedHandlerRef.current({ projectId, message });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  const joinProject = useCallback((projectId) => {
    if (!projectId) return;
    currentProjectRef.current = projectId;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("project:join", { projectId });
    }
  }, []);

  const leaveProject = useCallback((projectId) => {
    if (!projectId) return;

    if (currentProjectRef.current === projectId) {
      currentProjectRef.current = null;
      setActiveUsers([]);
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("project:leave", { projectId });
    }
  }, []);

  // Allows Board (or any consumer) to register a callback for kick events
  const onKicked = useCallback((handler) => {
    kickHandlerRef.current = handler;
    // Return cleanup
    return () => {
      kickHandlerRef.current = null;
    };
  }, []);

  // Allows Board to register a callback for access denied events
  const onAccessDenied = useCallback((handler) => {
    accessDeniedHandlerRef.current = handler;
    return () => {
      accessDeniedHandlerRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        activeUsers,
        joinProject,
        leaveProject,
        onKicked,
        onAccessDenied,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      isConnected: false,
      activeUsers: [],
      joinProject: () => {},
      leaveProject: () => {},
      onKicked: () => () => {},
      onAccessDenied: () => () => {},
    };
  }
  return context;
};
