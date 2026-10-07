import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import auth from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// GET ALL PROJECTS WITH TASK STATS
router.get("/", auth, async (req, res) => {
  try {
    const projectsWithStats = await Project.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user.id) }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "project",
          as: "projectTasks"
        }
      },
      {
        $addFields: {
          totalTasks: { $size: "$projectTasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: { $eq: ["$$task.status", "done"] }
              }
            }
          }
        }
      },
      {
        $project: { projectTasks: 0 }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(projectsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD PROJECT
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
      user: req.user.id
    });

    res.status(201).json({
      ...project.toObject(),
      totalTasks: 0,
      completedTasks: 0
    });
  } catch (err) {
    console.error("DB Create Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PROJECT
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { name, description, color } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PROJECT (AND ITS TASKS & ACTIVITIES)
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Cascade delete tasks and activities
    await Task.deleteMany({ project: req.params.id });
    await Activity.deleteMany({ projectId: req.params.id });

    res.json({ message: "Project and associated tasks deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

