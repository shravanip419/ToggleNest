import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import requireProjectAccess from "../middleware/projectAccessMiddleware.js";
import { emitToProject, kickUserFromProjectRoom } from "../socket.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PROJECTS (owned by OR member of)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const projectsWithStats = await Project.aggregate([
      {
        // Match projects where user is owner OR a member
        $match: {
          $or: [
            { user: userId },
            { "members.user": userId },
          ],
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "project",
          as: "projectTasks",
        },
      },
      {
        $addFields: {
          totalTasks: { $size: "$projectTasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: { $eq: ["$$task.status", "done"] },
              },
            },
          },
          // Expose role for the requesting user
          myRole: {
            $cond: {
              if: { $eq: ["$user", userId] },
              then: "owner",
              else: "member",
            },
          },
        },
      },
      { $project: { projectTasks: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(projectsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE PROJECT (owner or member)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", auth, requireProjectAccess("any"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("user", "name email avatar username")
      .populate("members.user", "name email avatar username");
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADD PROJECT
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      color: color || "purple",
      user: req.user.id,
      members: [],
    });

    res.status(201).json({
      ...project.toObject(),
      totalTasks: 0,
      completedTasks: 0,
      myRole: "owner",
    });
  } catch (err) {
    console.error("DB Create Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROJECT (owner only)
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", auth, requireProjectAccess("owner"), async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, color } },
      { new: true }
    );

    emitToProject(project._id, "project:updated", { project });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PROJECT (owner only, cascades tasks & activities)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", auth, requireProjectAccess("owner"), async (req, res) => {
  try {
    const project = req.project; // attached by middleware
    await Project.findByIdAndDelete(req.params.id);

    await Task.deleteMany({ project: req.params.id });
    await Activity.deleteMany({ projectId: req.params.id });

    emitToProject(project._id, "project:deleted", {
      projectId: project._id,
    });

    res.json({ message: "Project and associated tasks deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH USERS TO ADD AS MEMBERS (owner only)
// GET /api/projects/:id/members/search?q=<name|email>
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:id/members/search",
  auth,
  requireProjectAccess("owner"),
  async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: "Search query must be at least 2 characters" });
      }

      const project = req.project;

      // Collect IDs already in the project (owner + members) to exclude from results
      const excludedIds = [
        project.user.toString(),
        ...project.members.map((m) => m.user.toString()),
      ];

      const regex = new RegExp(q.trim(), "i");
      const users = await User.find({
        _id: { $nin: excludedIds },
        $or: [{ name: regex }, { email: regex }, { username: regex }],
      })
        .select("name email username avatar")
        .limit(10);

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET MEMBERS LIST (owner or member)
// GET /api/projects/:id/members
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/members", auth, requireProjectAccess("any"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("user", "name email avatar username")
      .populate("members.user", "name email avatar username");

    const owner = {
      ...project.user.toObject(),
      role: "owner",
    };

    const members = project.members.map((m) => ({
      ...m.user.toObject(),
      role: m.role,
      addedAt: m.addedAt,
    }));

    res.json({ owner, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADD MEMBER (owner only)
// POST /api/projects/:id/members  { userId }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/members", auth, requireProjectAccess("owner"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const project = req.project;

    // Prevent adding the owner as a member
    if (project.user.toString() === userId.toString()) {
      return res.status(400).json({ error: "Owner is already part of the project" });
    }

    // Prevent duplicates
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userId.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ error: "User is already a member of this project" });
    }

    // Verify the user exists
    const userToAdd = await User.findById(userId).select("name email avatar username");
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    project.members.push({ user: userId, role: "member" });
    await project.save();

    // Populate for response
    const updatedProject = await Project.findById(project._id)
      .populate("user", "name email avatar username")
      .populate("members.user", "name email avatar username");

    // Broadcast to all currently in the project room
    emitToProject(project._id, "project:member_added", {
      projectId: project._id.toString(),
      newMember: {
        ...userToAdd.toObject(),
        role: "member",
      },
    });

    res.status(201).json({
      message: `${userToAdd.name} added as a member`,
      member: { ...userToAdd.toObject(), role: "member" },
    });
  } catch (err) {
    console.error("Add member error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE MEMBER (owner only)
// DELETE /api/projects/:id/members/:userId
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
  "/:id/members/:userId",
  auth,
  requireProjectAccess("owner"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const project = req.project;

      // Cannot remove the owner
      if (project.user.toString() === userId.toString()) {
        return res.status(400).json({ error: "Cannot remove the project owner" });
      }

      const memberIndex = project.members.findIndex(
        (m) => m.user.toString() === userId.toString()
      );

      if (memberIndex === -1) {
        return res.status(404).json({ error: "Member not found in this project" });
      }

      project.members.splice(memberIndex, 1);
      await project.save();

      // Kick removed user from the Socket.IO project room
      kickUserFromProjectRoom(project._id.toString(), userId.toString());

      // Broadcast removal to remaining project room members
      emitToProject(project._id, "project:member_removed", {
        projectId: project._id.toString(),
        removedUserId: userId.toString(),
      });

      res.json({ message: "Member removed successfully", removedUserId: userId });
    } catch (err) {
      console.error("Remove member error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
