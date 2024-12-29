const express = require('express');
const router = express.Router();
const Test = require('../models/test');

// Create a new test
router.post('/', async (req, res) => {
    try {
        const { test_name, subject, date, batch_id, total_marks } = req.body;
        const newTest = await Test.create({ test_name, subject, date, batch_id, total_marks });
        res.status(201).json(newTest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all tests
router.get('/', async (req, res) => {
    try {
        const tests = await Test.findAll();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a test by ID
router.get('/:id', async (req, res) => {
    try {
        const test = await Test.findByPk(req.params.id);
        if (test) {
            res.json(test);
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
