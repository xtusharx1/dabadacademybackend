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

// Get student test records by batch_id
router.get('/batch/:batch_id', async (req, res) => {
    try {
        const { batch_id } = req.params;
        
        // Assuming the user_id or test_id is linked with batch_id in your model
        const records = await StudentTestRecords.findAll({
            include: {
                model: User,  // Assuming you have a 'User' model or similar for student details
                where: {
                    batch_id: batch_id
                },
                attributes: ['user_id', 'name', 'batch_id'] // Example attributes to include
            }
        });

        if (records.length > 0) {
            res.json(records);
        } else {
            res.status(404).json({ message: 'No records found for this batch.' });
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
