const express = require('express');
const router = express.Router();
const StudentTestRecords = require('../models/StudentTestRecords');

// Create a new student test record
router.post('/', async (req, res) => {
    try {
        const { test_id, user_id, marks_obtained } = req.body;
        const newRecord = await StudentTestRecords.create({ test_id, user_id, marks_obtained });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all student test records
router.get('/', async (req, res) => {
    try {
        const records = await StudentTestRecords.findAll();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student test records by test_id
router.get('/test/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        // Fetch student test records based on test_id
        const records = await StudentTestRecords.findAll({
            where: { test_id: test_id },
            attributes: ['record_id', 'test_id', 'user_id', 'marks_obtained'] // Fetch only required fields
        });

        if (records.length > 0) {
            // Send the records with only the required attributes
            res.json(records);
        } else {
            res.status(404).json({ message: 'No records found for this test.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Edit a student test record
router.put('/:record_id', async (req, res) => {
    try {
        const { record_id } = req.params;
        const { test_id, user_id, marks_obtained } = req.body;

        // Find the record to update
        const record = await StudentTestRecords.findByPk(record_id);
        
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Update the record
        const updatedRecord = await record.update({
            test_id,
            user_id,
            marks_obtained
        });

        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
