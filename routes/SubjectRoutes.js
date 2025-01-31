const express = require('express');
const Subject = require('../models/subject'); // Import the Subject model

const router = express.Router();

// Get all subjects (similar to the students route example)
router.get('/', async (req, res) => {
  try {
    const subjectsData = await Subject.findAll({
      attributes: ['subject_id', 'subject_name', 'created_at'],
    });

    if (!subjectsData.length) {
      return res.status(404).json({ message: 'No subjects found' });
    }

    res.status(200).json(subjectsData);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new subject (similar to the original route)
router.post('/', async (req, res) => {
  try {
    const { subject_name } = req.body;

    if (!subject_name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const createdSubject = await Subject.create({ subject_name });
    res.status(201).json(createdSubject); // Send created subject as response
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name } = req.body;

    if (!subject_name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const [updatedRows] = await Subject.update(
      { subject_name },
      { where: { subject_id: id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Subject.destroy({
      where: { subject_id: id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(204).send(); // No content response
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
