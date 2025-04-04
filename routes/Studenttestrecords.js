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
            attributes: ['record_id', 'test_id', 'user_id', 'marks_obtained', 'created_at', 'updated_at'] // Include timestamps
        });

        if (records.length > 0) {
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
// Get the rank of a student in a specific test
router.get('/rank/:test_id/:user_id', async (req, res) => {
    try {
        const { test_id, user_id } = req.params;

        // Fetch all test records for the given test_id
        const records = await StudentTestRecords.findAll({
            where: { test_id },
            order: [['marks_obtained', 'DESC']], // Sort by marks in descending order
            attributes: ['user_id', 'marks_obtained']
        });

        if (records.length === 0) {
            return res.status(404).json({ message: 'No records found for this test.' });
        }

        // Find the rank of the user
        const rank = records.findIndex(record => record.user_id === parseInt(user_id)) + 1;

        if (rank === 0) {
            return res.status(404).json({ message: `No records found for user ID ${user_id} in test ID ${test_id}.` });
        }

        res.json({ test_id, user_id, rank });
    } catch (error) {
        console.error(error); // Log the error for debugging
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
            attributes: ['record_id', 'test_id', 'user_id', 'marks_obtained', 'created_at', 'updated_at'] // Include timestamps
        });

        if (records.length > 0) {
            res.json(records);
        } else {
            res.status(404).json({ message: 'No records found for this user.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/statistics/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;

        // Fetch aggregated statistics for the specified test_id
        const statistics = await StudentTestRecords.findOne({
            attributes: [
                'test_id',
                [Sequelize.fn('MAX', Sequelize.col('marks_obtained')), 'highest_marks'],
                [Sequelize.fn('MIN', Sequelize.col('marks_obtained')), 'lowest_marks'],
                [Sequelize.fn('AVG', Sequelize.col('marks_obtained')), 'average_marks']
            ],
            where: { test_id: test_id },
            group: ['test_id'], // Group by test_id
        });

        if (statistics) {
            // Fetch created_at and updated_at for the specific test_id (subquery or additional fetch)
            const firstRecord = await StudentTestRecords.findOne({
                attributes: ['created_at', 'updated_at'],
                where: { test_id: test_id },
                order: [['created_at', 'ASC']], // Get the first record
            });

            const lastRecord = await StudentTestRecords.findOne({
                attributes: ['created_at', 'updated_at'],
                where: { test_id: test_id },
                order: [['updated_at', 'DESC']], // Get the last record
            });

            res.json({
                ...statistics.dataValues,
                first_created_at: firstRecord ? firstRecord.created_at : null,
                last_updated_at: lastRecord ? lastRecord.updated_at : null
            });
        } else {
            res.status(404).json({ message: `No records found for test ID ${test_id}.` });
        }
    } catch (error) {
        console.error(error); // Log the error for better debugging
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
