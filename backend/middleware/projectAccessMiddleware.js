import Project from "../models/Project.js";

/**
 * Middleware factory for project authorization.
 *
 * Usage:
 *   requireProjectAccess()           → owner OR member
 *   requireProjectAccess("owner")    → owner only
 *
 * Expects: req.user.id (set by authMiddleware), req.params.id or req.query.projectId
 */
const requireProjectAccess =
  (role = "any") =>
  async (req, res, next) => {
    try {
      // Determine project ID — from route param OR query string
      const projectId = req.params.id || req.params.projectId || req.query.projectId;

      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const isOwner = project.isOwner(req.user.id);
      const isMember = project.members.some(
        (m) => m.user.toString() === req.user.id.toString()
      );

      if (role === "owner" && !isOwner) {
        return res.status(403).json({
          error: "Only the project owner can perform this action",
        });
      }

      if (role === "any" && !isOwner && !isMember) {
        return res.status(403).json({
          error: "You do not have access to this project",
        });
      }

      // Attach project to req for downstream use (avoids re-fetching)
      req.project = project;
      req.isProjectOwner = isOwner;
      next();
    } catch (err) {
      console.error("Project auth middleware error:", err.message);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };

export default requireProjectAccess;
