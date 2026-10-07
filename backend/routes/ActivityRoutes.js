import express from "express";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { projectId } = req.query;

    // Get all project IDs owned by this user
    const userProjects = await Project.find({ user: req.user.id }).select("_id");
    const userProjectIds = userProjects.map(p => p._id);

    let filter = {
      $or: [
        { "user.id": req.user.id },
        { projectId: { $in: userProjectIds } }
      ]
    };

    if (projectId) {
      filter = {
        projectId,
        $or: [
          { "user.id": req.user.id },
          { projectId: { $in: userProjectIds } }
        ]
      };
    }

    const activities = await Activity
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("projectId", "name")
      .lean();

    const result = activities.map(a => ({
      ...a,
      projectName: a.projectId?.name || "General"
    }));

    res.json(result);

  } catch (err) {
    console.error("Activity API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET RECENT ACTIVITIES (for Dashboard)
router.get("/recent", auth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const userProjects = await Project.find({ user: req.user.id }).select("_id");
    const userProjectIds = userProjects.map(p => p._id);

    const activities = await Activity.find({
      $or: [
        { "user.id": req.user.id },
        { projectId: { $in: userProjectIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("projectId", "name")
      .lean();

    const formatted = activities.map(a => ({
      ...a,
      projectName: a.projectId?.name || "General",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("RECENT ACTIVITY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

