const express = require('express');
const FeeStatus = require('../models/FeeStatus');

const router = express.Router();

// Get all fee statuses
router.get('/', async (req, res) => {
  try {
    const feeStatuses = await FeeStatus.findAll(); // Remove the 'include' property
    res.json(feeStatuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single fee status by ID
router.get('/:id', async (req, res) => {
  try {
    const feeStatus = await FeeStatus.findByPk(req.params.id); // Remove the 'include' property
    if (!feeStatus) return res.status(404).json({ error: 'Fee status not found' });
    res.json(feeStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new fee status
router.post('/', async (req, res) => {
  try {
    const feeStatus = await FeeStatus.create(req.body);
    res.status(201).json(feeStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a fee status
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await FeeStatus.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Fee status not found' });
    const updatedFeeStatus = await FeeStatus.findByPk(req.params.id);
    res.json(updatedFeeStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a fee status
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FeeStatus.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Fee status not found' });
    res.status(204).json();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
