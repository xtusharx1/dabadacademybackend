const express = require('express');
const StudentBatch = require('../models/studentbatch'); // Import the StudentBatch model
const router = express.Router();

// Route: Fetch all students across all batches
router.get('/students', async (req, res) => {
  try {
    const studentsData = await StudentBatch.findAll({
      attributes: ['user_id', 'batch_id'],
    });

    if (!studentsData.length) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.status(200).json(studentsData);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Fetch all students in a specific batch
router.get('/students/batch/:batch_id', async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id) {
    return res.status(400).json({ message: 'Batch ID is required' });
  }

  try {
    const studentsData = await StudentBatch.findAll({
      where: { batch_id },
      attributes: ['user_id', 'batch_id'],
    });

    if (!studentsData.length) {
      return res.status(404).json({ message: `No students found in batch ${batch_id}` });
    }

    res.status(200).json(studentsData);
  } catch (error) {
    console.error('Error fetching students for batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Add a student to a specific batch
router.post('/students/batch', async (req, res) => {
  const { batch_id, user_id } = req.body;

  if (!batch_id || !user_id || isNaN(batch_id) || isNaN(user_id)) {
    return res.status(400).json({ message: 'Batch ID and User ID are required and must be valid numbers' });
  }

  try {
    const newStudent = await StudentBatch.create({ user_id, batch_id });
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding student to batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Get the count of all batches
router.get('/batches/count', async (req, res) => {
  try {
    const batchCounts = await StudentBatch.findAll({
      attributes: ['batch_id'],
      group: ['batch_id'],
    });

    res.status(200).json({ batchCount: batchCounts.length, batches: batchCounts });
  } catch (error) {
    console.error('Error fetching batch count:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Get the count of students in a specific batch
router.get('/batches/:batch_id/count', async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id || isNaN(batch_id)) {
    return res.status(400).json({ message: 'Valid Batch ID is required' });
  }

  try {
    const studentCount = await StudentBatch.count({ where: { batch_id } });
    res.status(200).json({ batch_id, studentCount });
  } catch (error) {
    console.error('Error fetching student count for batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Remove a student from a specific batch
router.delete('/students/batch', async (req, res) => {
  const { batch_id, user_id } = req.body;

  if (!batch_id || !user_id || isNaN(batch_id) || isNaN(user_id)) {
    return res.status(400).json({ message: 'Batch ID and User ID are required and must be valid numbers' });
  }

  try {
    const deletedCount = await StudentBatch.destroy({
      where: { user_id, batch_id },
    });

    if (!deletedCount) {
      return res.status(404).json({ message: `No record found for user ${user_id} in batch ${batch_id}` });
    }

    res.status(200).json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student from batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
