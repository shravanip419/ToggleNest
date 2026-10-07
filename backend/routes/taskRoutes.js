import express from "express";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import auth from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/* DASHBOARD STATS */
router.get("/dashboard", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET ALL USER TASKS (DASHBOARD) */
router.get("/dashboard/all", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .populate("project", "name")
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Dashboard task fetch error:", err);
    res.status(500).json({ message: "Dashboard task fetch failed" });
  }
});

/* GET TASKS BY PROJECT */
router.get("/", auth, async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const tasks = await Task.find({
      project: projectId,
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE TASK + ACTIVITY */
router.post("/", auth, async (req, res) => {
  try {
    const { title, projectId, status, priority, description, dueDate, assignee } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and projectId are required",
      });
    }

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

    await Activity.create({
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

    res.status(201).json(task);
  } catch (err) {
    console.error("TASK CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE TASK */
router.patch("/:id", auth, async (req, res) => {
  try {
    const oldTask = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!oldTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
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

    await Activity.create({
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

    res.json(updatedTask);
  } catch (err) {
    console.error("TASK UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* DELETE TASK */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Cleanup associated activities
    await Activity.deleteMany({ taskId: req.params.id });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

