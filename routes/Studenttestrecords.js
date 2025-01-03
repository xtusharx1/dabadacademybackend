const express = require('express');
const router = express.Router();
const StudentTestRecords = require('../models/StudentTestRecords');
const { Sequelize, Op } = require('sequelize'); // Import Sequelize and Op for operators


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
// Get student test records by user_id
router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch student test records based on user_id
        const records = await StudentTestRecords.findAll({
            where: { user_id: user_id },
            attributes: ['record_id', 'test_id', 'user_id', 'marks_obtained'] // Fetch only required fields
        });

        if (records.length > 0) {
            // Send the records with only the required attributes
            res.json(records);
        } else {
            res.status(404).json({ message: 'No records found for this user.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get statistics for a specific test_id
// Get statistics for a specific test_id
router.get('/statistics/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;

        // Fetch aggregated statistics for the specified test_id
        const statistics = await StudentTestRecords.findOne({
            attributes: [
                'test_id', // Include test_id in the selected fields
                [Sequelize.fn('MAX', Sequelize.col('marks_obtained')), 'highest_marks'],
                [Sequelize.fn('MIN', Sequelize.col('marks_obtained')), 'lowest_marks'],
                [Sequelize.fn('AVG', Sequelize.col('marks_obtained')), 'average_marks'],
            ],
            where: { test_id: test_id },
            group: ['test_id'], // Group by test_id
        });

        if (statistics) {
            res.json(statistics);
        } else {
            res.status(404).json({ message: `No records found for test ID ${test_id}.` });
        }
    } catch (error) {
        console.error(error); // Log the error for better debugging
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
