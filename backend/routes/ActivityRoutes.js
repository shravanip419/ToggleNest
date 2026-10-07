import express from "express";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper: get all project IDs accessible by user (owner or member)
const getAccessibleProjectIds = async (userId) => {
  const projects = await Project.find({
    $or: [
      { user: userId },
      { "members.user": userId },
    ],
  }).select("_id");
  return projects.map((p) => p._id);
};

// GET ACTIVITIES (optionally filtered by projectId)
router.get("/", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const accessibleProjectIds = await getAccessibleProjectIds(req.user.id);

    let filter;

    if (projectId) {
      // Verify user actually has access to this specific project
      const hasAccess = accessibleProjectIds.some(
        (id) => id.toString() === projectId.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this project's activity" });
      }
      filter = { projectId };
    } else {
      // All activities for all accessible projects
      filter = { projectId: { $in: accessibleProjectIds } };
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .populate("projectId", "name")
      .lean();

    const result = activities.map((a) => ({
      ...a,
      projectName: a.projectId?.name || "General",
    }));

    res.json(result);
  } catch (err) {
    console.error("Activity API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET RECENT ACTIVITIES (for Dashboard notifications)
router.get("/recent", auth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const accessibleProjectIds = await getAccessibleProjectIds(req.user.id);

    const activities = await Activity.find({
      projectId: { $in: accessibleProjectIds },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("projectId", "name")
      .lean();

    const formatted = activities.map((a) => ({
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
