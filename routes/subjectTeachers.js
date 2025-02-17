const express = require("express");
const router = express.Router();
const SubjectTeacher = require("../models/subjectTeachers");
const sequelize = require('../config/db'); // Make sure to import your sequelize instance

const { QueryTypes } = require('sequelize');
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
router.put('/update/:subject_id/:user_id', async (req, res) => {
  const { subject_id, user_id } = req.params;
  const { new_subject_id } = req.body;  // Extract new_subject_id from request body

  try {
      // Check if new_subject_id is provided
      if (!new_subject_id) {
          return res.status(400).json({ message: 'new_subject_id is required' });
      }

      // Fetch the SubjectTeacher record using provided subject_id and user_id
      const subjectTeacher = await SubjectTeacher.findOne({
          where: { subject_id, user_id }
      });

      // If the SubjectTeacher record is not found
      if (!subjectTeacher) {
          return res.status(404).json({ message: 'SubjectTeacher record not found' });
      }

      // Log before the update
      console.log("Before save:", subjectTeacher.subject_id);

      // Prepare the manual query to update the subject_id
      const updateQuery = `
          UPDATE public."SubjectTeachers"
          SET subject_id = :new_subject_id
          WHERE user_id = :user_id AND subject_id = :subject_id
          RETURNING subject_id, user_id;
      `;

      // Execute the query
      const updatedSubject = await sequelize.query(updateQuery, {
          replacements: { 
              new_subject_id, 
              user_id, 
              subject_id 
          },
          type: QueryTypes.UPDATE
      });

      // If no rows were affected, log and return an error message
      if (updatedSubject[0].length === 0) {
          return res.status(404).json({ message: 'No record was updated. Please check the subject_id and user_id.' });
      }

      // Log after the update
      console.log("After save:", updatedSubject[0][0].subject_id);

      // Return the updated subject-teacher record with new subject_id and user_id
      res.status(200).json({
          message: 'SubjectTeacher updated successfully',
          data: updatedSubject[0][0]  // Returning the updated record
      });
  } catch (error) {
      // Log error and return a response
      console.error("Error updating SubjectTeacher:", error);
      res.status(500).json({ message: 'An error occurred while updating SubjectTeacher', error: error.message });
  }
});

module.exports = router;
