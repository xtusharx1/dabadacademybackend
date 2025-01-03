const express = require('express');
const FeeStatus = require('../models/FeeStatus');

const { Op, Sequelize } = require('sequelize');
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
router.get('/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Total number of students
    const totalStudents = await FeeStatus.count();

    // Total due fees (sum of remaining fees)
    const totalDueFee = await FeeStatus.findOne({
      attributes: [
        [Sequelize.literal('SUM(CAST("remainingFees" AS NUMERIC))'), 'totalDueFee'],
      ],
    });

    // Total fees due today
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
router.get('/upcoming-dues', async (req, res) => {
  try {
    // Fetch all students with their upcoming fee dues
    const upcomingDues = await FeeStatus.findAll({
      attributes: [
        'id',
        'admissionDate',
        'totalFees',
        'feesSubmitted',
        'remainingFees',
        'nextDueDate',
        'user_id',
      ],
      where: {
        nextDueDate: {
          [Sequelize.Op.gt]: new Date(), // Fetch records where the nextDueDate is greater than today
        },
      },
      order: [['nextDueDate', 'ASC']], // Sort by the closest due date
    });

    res.json(upcomingDues);
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
