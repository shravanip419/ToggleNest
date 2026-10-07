import express from "express";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import auth from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { emitToProject, emitToUser } from "../socket.js";

const router = express.Router();

// ─── Helper: check project access (owner or member) ──────────────────────────
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  if (project.isAuthorized(userId)) return project;
  return false; // found but not authorized
};

/* DASHBOARD STATS */
router.get("/dashboard", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET ALL USER TASKS (DASHBOARD) — tasks created by user */
router.get("/dashboard/all", auth, async (req, res) => {
  try {
    // Include tasks from own projects + shared projects (as member)
    const userId = req.user.id;

    // Get all projects the user is authorized for
    const projects = await Project.find({
      $or: [{ user: userId }, { "members.user": userId }],
    }).select("_id");

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      $or: [
        { user: userId },                        // tasks user created
        { project: { $in: projectIds } },        // tasks in projects user belongs to
      ],
    })
      .populate("project", "name")
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Dashboard task fetch error:", err);
    res.status(500).json({ message: "Dashboard task fetch failed" });
  }
});

/* GET TASKS BY PROJECT — must be owner or member */
router.get("/", auth, async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const access = await checkProjectAccess(projectId, req.user.id);
    if (access === null) return res.status(404).json({ message: "Project not found" });
    if (access === false) return res.status(403).json({ message: "Access denied to this project" });

    // Members can see ALL tasks in the project, not just their own
    const tasks = await Task.find({ project: projectId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE TASK + ACTIVITY + SOCKET BROADCAST */
router.post("/", auth, async (req, res) => {
  try {
    const { title, projectId, status, priority, description, dueDate, assignee } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and projectId are required" });
    }

    // Verify project access
    const access = await checkProjectAccess(projectId, req.user.id);
    if (access === null) return res.status(404).json({ message: "Project not found" });
    if (access === false) return res.status(403).json({ message: "Access denied to this project" });

    const user = await User.findById(req.user.id);

    const task = await Task.create({
      title: title.trim(),
      status: status || "todo",
      priority: priority || "medium",
      description: description ? description.trim() : "",
      dueDate: dueDate || "",
      assignee: assignee ? assignee.trim() : "",
      project: projectId,
      user: req.user.id,
    });

    const activity = await Activity.create({
      type: "created",
      message: `created task "${task.title}"`,
      taskTitle: task.title,
      projectId: task.project,
      taskId: task._id,
      user: {
        id: user._id,
        name: user.name || user.username,
        avatar: user.avatar || "https://i.pravatar.cc/150",
      },
    });

    emitToProject(projectId, "task:created", { task, activity });
    emitToUser(req.user.id, "activity:new", activity);

    res.status(201).json(task);
  } catch (err) {
    console.error("TASK CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE TASK + ACTIVITY + SOCKET BROADCAST */
router.patch("/:id", auth, async (req, res) => {
  try {
    // Find the task first (allow any project member to update)
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check project membership
    const access = await checkProjectAccess(existingTask.project, req.user.id);
    if (access === false) return res.status(403).json({ message: "Access denied to this project" });

    const oldTask = existingTask;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    const user = await User.findById(req.user.id);

    let type = "updated";
    let message = `updated task "${updatedTask.title}"`;

    if (req.body.status && req.body.status !== oldTask.status) {
      if (req.body.status === "done") {
        type = "completed";
        message = `completed task "${updatedTask.title}"`;
      } else if (req.body.status === "in-progress") {
        message = `moved "${updatedTask.title}" to In Progress`;
      } else if (req.body.status === "todo") {
        message = `moved "${updatedTask.title}" to To Do`;
      }
    } else if (req.body.priority && req.body.priority !== oldTask.priority) {
      message = `changed priority of "${updatedTask.title}" to ${req.body.priority}`;
    } else if (req.body.assignee && req.body.assignee !== oldTask.assignee) {
      type = "assigned";
      message = `assigned "${updatedTask.title}" to ${req.body.assignee}`;
    }

    const activity = await Activity.create({
      type,
      message,
      taskTitle: updatedTask.title,
      projectId: updatedTask.project,
      taskId: updatedTask._id,
      user: {
        id: user._id,
        name: user.name || user.username,
        avatar: user.avatar || "https://i.pravatar.cc/150",
      },
    });

    emitToProject(updatedTask.project, "task:updated", { task: updatedTask, activity });
    emitToUser(req.user.id, "activity:new", activity);

    res.json(updatedTask);
  } catch (err) {
    console.error("TASK UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* DELETE TASK + SOCKET BROADCAST */
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check project membership
    const access = await checkProjectAccess(task.project, req.user.id);
    if (access === false) return res.status(403).json({ message: "Access denied to this project" });

    // Only task creator or project owner can delete
    const isTaskCreator = task.user.toString() === req.user.id.toString();
    const isProjectOwner = access && access.isOwner(req.user.id);
    if (!isTaskCreator && !isProjectOwner) {
      return res.status(403).json({ message: "Only the task creator or project owner can delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    await Activity.deleteMany({ taskId: req.params.id });

    emitToProject(task.project, "task:deleted", {
      taskId: task._id.toString(),
      projectId: task.project.toString(),
    });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
