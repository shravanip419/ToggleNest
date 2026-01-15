import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js"; //
import auth from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// GET ALL PROJECTS WITH TASK STATS
router.get("/", auth, async (req, res) => {
  try {
    const projectsWithStats = await Project.aggregate([
      {
        // 1. Only get projects belonging to this user
        $match: { userId: new mongoose.Types.ObjectId(req.userId) } 
      },
      {
        // 2. Look up tasks for each project
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          as: "projectTasks"
        }
      },
      {
        // 3. Add fields for total and completed counts
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
        // 4. Remove the raw tasks array to keep the response light
        $project: { projectTasks: 0 }
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
    const project = await Project.create({ 
      name: req.body.name,
      userId: req.userId 
    });
    // console.log("Project created in DB:", project); Log on server side too
    res.status(201).json(project);
  } catch (err) {
    console.error("DB Create Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;