import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PROJECT
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      members: [req.user.id],
    });

    await User.findByIdAndUpdate(req.user.id, { $push: { projects: project._id } });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// JOIN PROJECT
router.post("/:id/join", verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.members.includes(req.user.id)) {
      project.members.push(req.user.id);
      await project.save();

      await User.findByIdAndUpdate(req.user.id, { $push: { projects: project._id } });
    }

    res.json({ message: "Joined project", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER PROJECTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("projects");
    res.json(user.projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
