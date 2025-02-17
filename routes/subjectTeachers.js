const express = require("express");
const router = express.Router();
const SubjectTeacher = require("../models/subjectTeachers");

// ✅ Assign a teacher to a subject
router.post("/assign", async (req, res) => {
  try {
    const { subject_id, user_id } = req.body;
    if (!subject_id || !user_id) {
      return res.status(400).json({ error: "Subject ID and User ID are required." });
    }

    const assignment = await SubjectTeacher.create({ subject_id, user_id });
    res.status(201).json({ message: "Teacher assigned successfully.", assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all subject-teacher assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await SubjectTeacher.findAll();
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get teachers assigned to a specific subject
router.get("/subject/:subject_id", async (req, res) => {
  try {
    const { subject_id } = req.params;
    const assignments = await SubjectTeacher.findAll({
      where: { subject_id }
    });

    if (!assignments.length) {
      return res.status(404).json({ message: "No teachers assigned to this subject." });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get subjects assigned to a specific teacher
router.get("/teacher/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const assignments = await SubjectTeacher.findAll({
      where: { user_id }
    });

    if (!assignments.length) {
      return res.status(404).json({ message: "No subjects assigned to this teacher." });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Remove a teacher from a subject
router.delete("/unassign", async (req, res) => {
  try {
    const { subject_id, user_id } = req.body;

    const deleted = await SubjectTeacher.destroy({
      where: { subject_id, user_id },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    res.status(200).json({ message: "Teacher unassigned successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
