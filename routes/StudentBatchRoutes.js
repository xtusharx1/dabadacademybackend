// routes/studentBatchRoutes.js

const express = require('express');
const { User, Batch } = require('../models/studentbatch');
const router = express.Router();

// Controller for getting all students in a batch
router.get('/:batch_id/students', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const batch = await Batch.findByPk(batch_id, {
      include: User, // Include the associated students
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(batch.Users); // List of students in the batch
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
});

// Controller for adding students to a batch
router.post('/add', async (req, res) => {
  const { batch_id, student_ids } = req.body;

  try {
    // Map student_ids to bulk insert records
    const records = student_ids.map((student_id) => ({
      student_id,
      batch_id,
    }));

    // Insert records directly
    await StudentBatch.bulkCreate(records);

    res.status(200).json({ message: 'Students added to batch successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding students to batch', error });
  }
});

// Controller for removing a student from a batch
router.post('/remove', async (req, res) => {
  const { batch_id, student_ids } = req.body;

  try {
    const batch = await Batch.findByPk(batch_id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const students = await User.findAll({
      where: {
        user_id: student_ids,
      },
    });

    // Remove students from the batch
    await batch.removeStudents(students);

    res.status(200).json({ message: 'Students removed from batch successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing students from batch', error });
  }
});

module.exports = router;
