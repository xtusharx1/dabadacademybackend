// routes/batchRoutes.js

const express = require('express');
const { Batch } = require('../models/batch');
const router = express.Router();

// Controller for getting all batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.findAll();
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error });
  }
});

// Controller for creating a new batch
router.post('/', async (req, res) => {
  try {
    const { batch_name } = req.body;
    const newBatch = await Batch.create({ batch_name });
    res.status(201).json(newBatch);
  } catch (error) {
    res.status(500).json({ message: 'Error creating batch', error });
  }
});

// Controller for getting a specific batch
router.get('/:batch_id', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch', error });
  }
});

module.exports = router;
