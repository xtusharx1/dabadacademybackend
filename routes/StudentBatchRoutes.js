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
// Route: Update a student's batch
router.put('/update', async (req, res) => {
  const { user_id, old_batch_id, new_batch_id } = req.body;

  if (!user_id || !old_batch_id || !new_batch_id || isNaN(user_id) || isNaN(old_batch_id) || isNaN(new_batch_id)) {
    return res.status(400).json({ message: 'User ID, Old Batch ID, and New Batch ID are required and must be valid numbers' });
  }

  try {
    // Find the student in the old batch
    const student = await StudentBatch.findOne({
      where: { user_id, batch_id: old_batch_id },
    });

    if (!student) {
      return res.status(404).json({ message: `No record found for user ${user_id} in batch ${old_batch_id}` });
    }

    // Update batch_id to new_batch_id
    student.batch_id = new_batch_id;
    await student.save();

    res.status(200).json({ message: 'Student batch updated successfully', student });
  } catch (error) {
    console.error('Error updating student batch:', error);
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
// Route: Search for a student by user_id
router.get('/students/search/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ message: 'Valid User ID is required' });
  }

  try {
    const studentData = await StudentBatch.findAll({
      where: { user_id },
      attributes: ['user_id', 'batch_id'],
    });

    if (!studentData.length) {
      return res.status(404).json({ message: `No student found with User ID ${user_id}` });
    }

    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error searching student by user ID:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
