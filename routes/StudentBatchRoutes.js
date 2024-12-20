const express = require('express');
const { User, Batch, StudentBatch } = require('../models/studentbatch'); // Adjusted import
const router = express.Router();

// Controller for getting all users in a batch
router.get('/:batch_id/users', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const batch = await Batch.findByPk(batch_id, {
      include: User, // Include the associated users
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(batch.Users); // List of users in the batch
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Controller for adding users to a batch
router.post('/add', async (req, res) => {
  const { batch_id, user_ids } = req.body;

  try {
    // Map user_ids to bulk insert records
    const records = user_ids.map((user_id) => ({
      user_id,
      batch_id,
    }));

    // Insert records directly
    await StudentBatch.bulkCreate(records);

    res.status(200).json({ message: 'Users added to batch successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding users to batch', error });
  }
});

// Controller for removing a user from a batch
router.post('/remove', async (req, res) => {
  const { batch_id, user_ids } = req.body;

  try {
    const batch = await Batch.findByPk(batch_id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const users = await User.findAll({
      where: {
        user_id: user_ids,
      },
    });

    // Remove users from the batch
    await batch.removeUsers(users);

    res.status(200).json({ message: 'Users removed from batch successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing users from batch', error });
  }
});

module.exports = router;
