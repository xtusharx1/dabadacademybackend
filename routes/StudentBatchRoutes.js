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

  // Validate input
  if (!batch_id || !Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ message: 'Invalid batch_id or student_ids' });
  }

  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    const batch = await Batch.findByPk(batch_id, { transaction });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Fetch the students based on student_ids
    const students = await User.findAll({
      where: {
        user_id: student_ids,
      },
      transaction,
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No valid students found for the provided IDs' });
    }

    // Associate the students with the batch
    await batch.addStudents(students, { transaction });

    await transaction.commit(); // Commit the transaction

    res.status(200).json({
      message: 'Students added to batch successfully',
      batch_id,
      student_count: students.length,
      student_ids: students.map(student => student.user_id),
    });
  } catch (error) {
    await transaction.rollback(); // Roll back the transaction in case of error
    console.error('Error adding students to batch:', error);
    res.status(500).json({
      message: 'Error adding students to batch',
      error: error.message || 'Unknown error',
    });
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
