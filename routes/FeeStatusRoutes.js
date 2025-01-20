const express = require('express');
const FeeStatus = require('../models/FeeStatus');

const { Op, Sequelize } = require('sequelize');
const router = express.Router();

// Get all fee statuses
router.get('/', async (req, res) => {
  try {
    const feeStatuses = await FeeStatus.findAll(); // This now includes paymentCompleted field
    res.json(feeStatuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get fee statuses by user_id
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const feeStatuses = await FeeStatus.findAll({
      where: { user_id },
      attributes: [
        'id',
        'admissionDate',
        'totalFees',
        'feesSubmitted',
        'remainingFees',
        'nextDueDate',
        'user_id',
        'paymentCompleted', // Add this to the response
      ],
    });

    if (feeStatuses.length === 0) {
      return res.status(404).json({ message: `No fee statuses found for user_id ${user_id}` });
    }

    res.status(200).json(feeStatuses);
  } catch (err) {
    console.error('Error fetching fee statuses by user_id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Summary endpoint
router.get('/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const totalStudents = await FeeStatus.count();

    const totalDueFee = await FeeStatus.findOne({
      attributes: [
        [Sequelize.literal('SUM(CAST("remainingFees" AS NUMERIC))'), 'totalDueFee'],
      ],
    });

    const totalDueToday = await FeeStatus.findOne({
      attributes: [
        [Sequelize.literal('SUM(CAST("remainingFees" AS NUMERIC))'), 'totalDueToday'],
      ],
      where: {
        nextDueDate: today,
      },
    });

    res.json({
      totalStudents,
      totalDueFee: totalDueFee?.dataValues?.totalDueFee || 0,
      totalDueToday: totalDueToday?.dataValues?.totalDueToday || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch upcoming dues, including payment status
router.get('/upcoming-dues', async (req, res) => {
  try {
    const allDues = await FeeStatus.findAll({
      attributes: [
        'id',
        'admissionDate',
        'totalFees',
        'feesSubmitted',
        'remainingFees',
        'nextDueDate',
        'user_id',
        'paymentCompleted', // Add paymentCompleted to the results
      ],
    });

    const sortedDues = allDues.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

    res.json(sortedDues);
  } catch (err) {
    console.error("Error fetching all dues:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get a single fee status by ID
router.get('/:id', async (req, res) => {
  try {
    const feeStatus = await FeeStatus.findByPk(req.params.id); 
    if (!feeStatus) return res.status(404).json({ error: 'Fee status not found' });
    res.json(feeStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new fee status (with paymentCompleted)
router.post('/', async (req, res) => {
  try {
    // Ensure the paymentCompleted field is included in the request body
    const feeStatus = await FeeStatus.create({
      ...req.body, // Includes the paymentCompleted field from the request body
      paymentCompleted: req.body.paymentCompleted || false, // Default to false if not provided
    });
    res.status(201).json(feeStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a fee status (with paymentCompleted)
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await FeeStatus.update(req.body, {
      where: { id: req.params.id },
    });
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
