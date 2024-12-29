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

// Edit a test by ID
router.put('/:id', async (req, res) => {
    try {
        const { test_name, subject, date, batch_id, total_marks } = req.body;
        const test = await Test.findByPk(req.params.id);
        if (test) {
            test.test_name = test_name || test.test_name;
            test.subject = subject || test.subject;
            test.date = date || test.date;
            test.batch_id = batch_id || test.batch_id;
            test.total_marks = total_marks || test.total_marks;
            await test.save();
            res.json(test);
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a test by ID
router.delete('/:id', async (req, res) => {
    try {
        const test = await Test.findByPk(req.params.id);
        if (test) {
            await test.destroy();
            res.json({ message: 'Test deleted successfully' });
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
