const express = require('express');
const FeeStatus = require('../models/FeeStatus');
const { Op, Sequelize } = require('sequelize');
const router = express.Router();

// Get all fee statuses
router.get('/', async (req, res) => {
  try {
    const feeStatuses = await FeeStatus.findAll();
    res.json(feeStatuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get fee statuses by user_id (supports optional batch_id filtering)
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { batch_id } = req.query;

  try {
    let targetBatchId = batch_id;

    // If batch_id is not provided (e.g. from the mobile app),
    // fetch the student's current active batch from StudentBatch table
    if (!targetBatchId) {
      const StudentBatch = require('../models/studentbatch');
      const activeBatchRecord = await StudentBatch.findOne({
        where: { user_id },
        order: [['created_at', 'DESC']]
      });
      if (activeBatchRecord) {
        targetBatchId = activeBatchRecord.batch_id;
      }
    }

    const whereClause = { user_id };
    if (targetBatchId) {
      whereClause.batch_id = targetBatchId;
    }

    const feeStatuses = await FeeStatus.findAll({
      where: whereClause,
      attributes: [
        'id',
        'admissionDate',
        'totalFees',
        'feesSubmitted',
        'remainingFees',
        'nextDueDate',
        'user_id',
        'batch_id',
        'paymentCompleted',
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
    const Batch = require('../models/batch');

    // Fetch all active batch IDs
    const activeBatches = await Batch.findAll({
      where: { is_active: true },
      attributes: ['batch_id'],
    });
    const activeBatchIds = activeBatches.map(b => b.batch_id);
    const whereClause = activeBatchIds.length > 0 ? { batch_id: { [Op.in]: activeBatchIds } } : { batch_id: null };

    const totalStudents = await FeeStatus.count({
      where: whereClause,
    });

    const totalDueFee = await FeeStatus.findOne({
      attributes: [
        [Sequelize.literal('SUM(CAST("remainingFees" AS NUMERIC))'), 'totalDueFee'],
      ],
      where: whereClause,
    });

    const totalDueToday = await FeeStatus.findOne({
      attributes: [
        [Sequelize.literal('SUM(CAST("remainingFees" AS NUMERIC))'), 'totalDueToday'],
      ],
      where: {
        nextDueDate: today,
        ...whereClause,
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
    const Batch = require('../models/batch');

    // Fetch all active batch IDs
    const activeBatches = await Batch.findAll({
      where: { is_active: true },
      attributes: ['batch_id'],
    });
    const activeBatchIds = activeBatches.map(b => b.batch_id);
    const whereClause = activeBatchIds.length > 0 ? { batch_id: { [Op.in]: activeBatchIds } } : { batch_id: null };

    const allDues = await FeeStatus.findAll({
      where: whereClause,
      attributes: [
        'id',
        'admissionDate',
        'totalFees',
        'feesSubmitted',
        'remainingFees',
        'nextDueDate',
        'user_id',
        'batch_id',
        'paymentCompleted',
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

// Create a new fee status
router.post('/', async (req, res) => {
  try {
    const feeStatus = await FeeStatus.create({
      ...req.body,
      paymentCompleted: req.body.paymentCompleted || false,
    });
    res.status(201).json(feeStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update fee status
router.put('/:id', async (req, res) => {
  try {
    const { paymentCompleted, nextDueDate, feesSubmitted, remainingFees } = req.body;

    const updatedData = {
      ...req.body,
      nextDueDate: paymentCompleted ? null : nextDueDate,
    };

    const [updated] = await FeeStatus.update(updatedData, {
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