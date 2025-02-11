const express = require('express');
const router = express.Router();
const Visit = require('../models/schoolVisit');

// Get all visits
router.get('/', async (req, res) => {
    try {
        const visits = await Visit.findAll();
        res.status(200).json({ data: visits });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visits', error: error.message });
    }
});

// Get visit by ID
router.get('/:id', async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id);
        if (!visit) return res.status(404).json({ message: 'Visit not found' });
        res.status(200).json(visit);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visit', error: error.message });
    }
});

// Create a new visit
router.post('/', async (req, res) => {
    try {
        const { school_id, personnel_id, visit_date, status } = req.body;
        const newVisit = await Visit.create({ school_id, personnel_id, visit_date, status });
        res.status(201).json(newVisit);
    } catch (error) {
        res.status(500).json({ message: 'Error adding visit', error: error.message });
    }
});

// Update a visit
router.put('/:id', async (req, res) => {
    try {
        const { school_id, personnel_id, visit_date, status } = req.body;
        const updated = await Visit.update(
            { school_id, personnel_id, visit_date, status },
            { where: { visit_id: req.params.id } }
        );
        if (!updated[0]) return res.status(404).json({ message: 'Visit not found' });
        res.status(200).json({ message: 'Visit updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating visit', error: error.message });
    }
});

// Delete a visit
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Visit.destroy({ where: { visit_id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Visit not found' });
        res.status(200).json({ message: 'Visit deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting visit', error: error.message });
    }
});

module.exports = router;
