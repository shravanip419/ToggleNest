import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Task from "../models/Task.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Search users by name/email (for member autocomplete)
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Query must be at least 2 characters" });
    }
    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      _id: { $ne: req.user.id }, // exclude self
      $or: [{ name: regex }, { email: regex }, { username: regex }],
    })
      .select("name email username avatar")
      .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile and tasks
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({ user, tasks });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update profile details (non-sensitive fields)
router.put("/me", auth, async (req, res) => {
  try {
    const { name, jobTitle, department, organization, location, avatar } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (department !== undefined) updateData.department = department;
    if (organization !== undefined) updateData.organization = organization;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// Update Password
router.put("/update-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("PASSWORD UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
});

export default router;

