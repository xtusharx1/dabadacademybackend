const express = require('express');
const Subject = require('../models/subject'); // Import the Subject model

const router = express.Router();

// Create a new subject
router.post('/', async (req, res) => {
    try {
        const { subject_name } = req.body;
        const createdSubject = await SubjectModel.create(subject_name);
        res.status(201).json(createdSubject); // Send created subject as response
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Read all subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await SubjectModel.getAll(); // Fetch all subjects
        res.status(200).json(subjects); // Send subjects as response
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a subject
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name } = req.body;
        const updatedMessage = await SubjectModel.update(id, subject_name);
        res.status(200).json(updatedMessage); // Send success message as response
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await SubjectModel.delete(id); // Delete subject
        res.status(204).send(); // No content response
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
