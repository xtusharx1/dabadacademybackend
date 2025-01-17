const express = require('express');
const Batch = require('../models/batch'); // Ensure correct import
const router = express.Router();

// Fetch all batches (with support for active/inactive status)
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.findAll();
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Error fetching batches', error });
  }
});

// Count all batches (including active and inactive)
router.get('/count', async (req, res) => {
  try {
    const batchCount = await Batch.count();
    res.status(200).json({ batch_count: batchCount });
  } catch (error) {
    console.error('Error fetching batch count:', error);
    res.status(500).json({ message: 'Error fetching batch count', error });
  }
});

// Create a new batch (default to active)
router.post('/', async (req, res) => {
  try {
    const { batch_name } = req.body;
    const newBatch = await Batch.create({ batch_name, is_active: true }); // Default to active
    res.status(201).json(newBatch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Error creating batch', error });
  }
});

// Delete a batch by ID
router.delete('/:batch_id', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await batch.destroy();
    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Error deleting batch', error });
  }
});

// Fetch a specific batch by ID
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
// Update a batch completely (PUT request)
router.put('/:batch_id', async (req, res) => {
  const { batch_id } = req.params;
  const { batch_name, is_active } = req.body;  // You can update batch_name and is_active (active/inactive status)

  try {
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Update the batch with the new details
    batch.batch_name = batch_name || batch.batch_name;  // Retain existing value if no new value provided
    batch.is_active = is_active !== undefined ? is_active : batch.is_active;  // Retain existing value if no new value provided

    await batch.save();
    res.status(200).json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ message: 'Error updating batch', error });
  }
});

// Mark a batch as inactive
router.patch('/:batch_id/inactive', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    batch.is_active = false;
    await batch.save();

    res.status(200).json({ message: 'Batch marked as inactive', batch });
  } catch (error) {
    console.error('Error marking batch as inactive:', error);
    res.status(500).json({ message: 'Error marking batch as inactive', error });
  }
});

module.exports = router;
