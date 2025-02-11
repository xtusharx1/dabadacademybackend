const express = require('express');
const router = express.Router();
const { MarketingPersonnel } = require('../config/db');

// Get all marketing personnel
router.get('/', async (req, res) => {
    try {
        const personnel = await MarketingPersonnel.findAll();
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personnel', error });
    }
});

// Get personnel by ID
router.get('/:id', async (req, res) => {
    try {
        const personnel = await MarketingPersonnel.findByPk(req.params.id);
        if (!personnel) return res.status(404).json({ message: 'Personnel not found' });
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personnel', error });
    }
});

// Add new marketing personnel
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const newPersonnel = await MarketingPersonnel.create({ name });
        res.json(newPersonnel);
    } catch (error) {
        res.status(500).json({ message: 'Error adding personnel', error });
    }
});

// Update personnel
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const updated = await MarketingPersonnel.update({ name }, { where: { personnel_id: req.params.id } });
        if (!updated[0]) return res.status(404).json({ message: 'Personnel not found' });
        res.json({ message: 'Personnel updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating personnel', error });
    }
});

// Delete personnel
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await MarketingPersonnel.destroy({ where: { personnel_id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Personnel not found' });
        res.json({ message: 'Personnel deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting personnel', error });
    }
});

module.exports = router;
