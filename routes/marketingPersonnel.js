const express = require('express');
const router = express.Router();
const MarketingPersonnel = require('../models/MarketingPersonnel');

// Get all marketing personnel
router.get('/', async (req, res) => {
    try {
        const personnel = await MarketingPersonnel.findAll();
        res.status(200).json({ data: personnel });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personnel', error: error.message });
    }
});

// Get personnel by ID
router.get('/:id', async (req, res) => {
    try {
        const personnel = await MarketingPersonnel.findByPk(req.params.id);
        if (!personnel) return res.status(404).json({ message: 'Personnel not found' });
        res.status(200).json(personnel);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personnel', error: error.message });
    }
});

// Add new marketing personnel
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const newPersonnel = await MarketingPersonnel.create({ name });
        res.status(201).json(newPersonnel);
    } catch (error) {
        res.status(500).json({ message: 'Error adding personnel', error: error.message });
    }
});

// Update personnel
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const updated = await MarketingPersonnel.update(
            { name },
            { where: { personnel_id: req.params.id } }
        );
        if (!updated[0]) return res.status(404).json({ message: 'Personnel not found' });
        res.status(200).json({ message: 'Personnel updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating personnel', error: error.message });
    }
});

// Delete personnel
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await MarketingPersonnel.destroy({ where: { personnel_id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Personnel not found' });
        res.status(200).json({ message: 'Personnel deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting personnel', error: error.message });
    }
});

module.exports = router;
