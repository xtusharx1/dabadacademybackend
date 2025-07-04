const express = require('express');
const StudentBatch = require('../models/studentbatch'); // Import the StudentBatch model
const User = require('../models/user'); // Import the User model for joins
const router = express.Router();

const { Op, fn, col } = require('sequelize');

// First, establish the association between StudentBatch and User
StudentBatch.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Route: Fetch all students across all batches (only active users)
router.get('/students', async (req, res) => {
  try {
    const studentsData = await StudentBatch.findAll({
      attributes: ['user_id', 'batch_id'],
      include: [{
        model: User,
        as: 'user',
        attributes: [],
        where: { status: 'active' }
      }]
    });

    if (!studentsData.length) {
      return res.status(404).json({ message: 'No active students found' });
    }

    res.status(200).json(studentsData);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Get student counts by date for a specific batch (only active users)
router.get('/student-counts/:batch_id', async (req, res) => {
  const { batch_id } = req.params;

  try {
    const results = await StudentBatch.findAll({
      where: { batch_id },
      attributes: [
        [fn('DATE', col('StudentBatch.created_at')), 'date'],
        [fn('COUNT', '*'), 'student_count']
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: [],
        where: { status: 'active' }
      }],
      group: [fn('DATE', col('StudentBatch.created_at'))],
      order: [[fn('DATE', col('StudentBatch.created_at')), 'ASC']],
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching student count for batch:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Update a student's batch (only if user is active)
router.put('/update', async (req, res) => {
  const { user_id, old_batch_id, new_batch_id } = req.body;

  if (!user_id || !old_batch_id || !new_batch_id || isNaN(user_id) || isNaN(old_batch_id) || isNaN(new_batch_id)) {
    return res.status(400).json({ message: 'User ID, Old Batch ID, and New Batch ID are required and must be valid numbers' });
  }

  try {
    // First check if user is active
    const user = await User.findOne({
      where: { user_id, status: 'active' }
    });

    if (!user) {
      return res.status(404).json({ message: `Active user with id ${user_id} not found` });
    }

    // Find the student in the old batch
    const student = await StudentBatch.findOne({
      where: { user_id, batch_id: old_batch_id },
    });

    if (!student) {
      return res.status(404).json({ message: `No record found for user ${user_id} in batch ${old_batch_id}` });
    }

    // Update batch_id to new_batch_id using update()
    await StudentBatch.update(
      { batch_id: new_batch_id },
      { where: { user_id, batch_id: old_batch_id } }
    );

    // Fetch updated record
    const updatedStudent = await StudentBatch.findOne({
      where: { user_id, batch_id: new_batch_id },
    });

    res.status(200).json({ message: 'Student batch updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Fetch all students in a specific batch (only active users)
router.get('/students/batch/:batch_id', async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id) {
    return res.status(400).json({ message: 'Batch ID is required' });
  }

  try {
    const studentsData = await StudentBatch.findAll({
      where: { batch_id },
      attributes: ['user_id', 'batch_id'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone_number', 'status'], // Include user details
        where: { status: 'active' }
      }]
    });

    if (!studentsData.length) {
      return res.status(404).json({ message: `No active students found in batch ${batch_id}` });
    }

    res.status(200).json(studentsData);
  } catch (error) {
    console.error('Error fetching students for batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Add a student to a specific batch (only if user is active)
router.post('/students/batch', async (req, res) => {
  const { batch_id, user_id } = req.body;

  if (!batch_id || !user_id || isNaN(batch_id) || isNaN(user_id)) {
    return res.status(400).json({ message: 'Batch ID and User ID are required and must be valid numbers' });
  }

  try {
    // First check if user exists and is active
    const user = await User.findOne({
      where: { user_id, status: 'active' }
    });

    if (!user) {
      return res.status(404).json({ message: `Active user with id ${user_id} not found` });
    }

    const newStudent = await StudentBatch.create({ user_id, batch_id });
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding student to batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Get the count of all batches (only count active users)
router.get('/batches/count', async (req, res) => {
  try {
    const batchCounts = await StudentBatch.findAll({
      attributes: ['batch_id'],
      include: [{
        model: User,
        as: 'user',
        attributes: [],
        where: { status: 'active' }
      }],
      group: ['batch_id'],
    });

    res.status(200).json({ batchCount: batchCounts.length, batches: batchCounts });
  } catch (error) {
    console.error('Error fetching batch count:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Get the count of students in a specific batch (only active users)
router.get('/batches/:batch_id/count', async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id || isNaN(batch_id)) {
    return res.status(400).json({ message: 'Valid Batch ID is required' });
  }

  try {
    const studentCount = await StudentBatch.count({ 
      where: { batch_id },
      include: [{
        model: User,
        as: 'user',
        attributes: [],
        where: { status: 'active' }
      }]
    });
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

// Route: Search for a student by user_id (only if user is active)
router.get('/students/search/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ message: 'Valid User ID is required' });
  }

  try {
    const studentData = await StudentBatch.findAll({
      where: { user_id },
      attributes: ['user_id', 'batch_id'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone_number', 'status'],
        where: { status: 'active' }
      }]
    });

    if (!studentData.length) {
      return res.status(404).json({ message: `No active student found with User ID ${user_id}` });
    }

    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error searching student by user ID:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
