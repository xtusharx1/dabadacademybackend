const express = require('express');
const Batch = require('../models/batch'); // Ensure correct import
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const batches = await Batch.findAll(); 
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Error fetching batches', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { batch_name } = req.body;
    const newBatch = await Batch.create({ batch_name });
    res.status(201).json(newBatch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Error creating batch', error });
  }
});

router.get('/:batch_id', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.status(200).json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ message: 'Error fetching batch', error });
  }
});

module.exports = router;
