const express = require('express');
const { User, Batch, StudentBatch } = require('../models/studentbatch'); // Adjusted import
const router = express.Router();

// Controller for getting all users in a batch
router.get('/:batch_id/users', async (req, res) => {
  const { batch_id } = req.params;

  try {
    // Fetch the student-batch relationship, including only user_id and batch_id
    const studentsInBatch = await StudentBatch.findAll({
      where: { batch_id },
      attributes: ['user_id', 'batch_id'], // Only return user_id and batch_id
    });

    if (!studentsInBatch || studentsInBatch.length === 0) {
      return res.status(404).json({ message: 'No users found in this batch' });
    }

    // Return the list of user_id and batch_id pairs
    res.status(200).json(studentsInBatch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Controller for adding users to a batch
router.post('/add', async (req, res) => {
  const { batch_id, user_ids } = req.body;

  try {
    // Validate the batch
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Validate the users
    const users = await User.findAll({
      where: {
        user_id: user_ids,
      },
    });

    if (users.length !== user_ids.length) {
      return res.status(404).json({ message: 'One or more users not found' });
    }

    // Prepare records for bulk insert
    const records = user_ids.map((user_id) => ({
      user_id,
      batch_id,
    }));

    // Insert the records into the StudentBatch table
    await StudentBatch.bulkCreate(records);

    res.status(200).json({ message: 'Users added to batch successfully' });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    res.status(500).json({ message: 'Error adding users to batch', error });
  }
});

// Controller for removing a user from a batch
router.post('/remove', async (req, res) => {
  const { batch_id, user_ids } = req.body;

  try {
    // Validate the batch
    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if the users exist in the StudentBatch table and remove them
    const deletedCount = await StudentBatch.destroy({
      where: {
        batch_id,
        user_id: user_ids,
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'No users found to remove from this batch' });
    }

    res.status(200).json({ message: 'Users removed from batch successfully' });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    res.status(500).json({ message: 'Error removing users from batch', error });
  }
});

module.exports = router;
