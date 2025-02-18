const express = require('express');
const teacherBatch = require('../models/teacherbatch');

const { Op } = require('sequelize');
const router = express.Router();

// ✅ Get all teacher-batch assignments
router.get('/', async (req, res) => {
    try {
        const assignments = await teacherBatch.findAll({
            attributes: ['user_id', 'batch_id', 'created_at']
        });

        if (!assignments.length) {
            return res.status(404).json({ message: 'No teacher-batch assignments found' });
        }

        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ Get all batches for a specific teacher
router.get('/teacher/:user_id/batches', async (req, res) => {
    const { user_id } = req.params;

    try {
        const teacherBatches = await teacherBatch.findAll({
            where: { user_id },
            attributes: ['batch_id', 'created_at']
        });

        if (!teacherBatches.length) {
            return res.status(404).json({ 
                message: `No batches found for teacher ${user_id}` 
            });
        }

        res.status(200).json(teacherBatches);
    } catch (error) {
        console.error('Error fetching teacher batches:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ Get all teachers for a specific batch
router.get('/batch/:batch_id/teachers', async (req, res) => {
    const { batch_id } = req.params;

    try {
        const batchTeachers = await teacherBatch.findAll({
            where: { batch_id },
            attributes: ['user_id', 'created_at']
        });

        if (!batchTeachers.length) {
            return res.status(404).json({ 
                message: `No teachers found for batch ${batch_id}` 
            });
        }

        res.status(200).json(batchTeachers);
    } catch (error) {
        console.error('Error fetching batch teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ Assign multiple batches to a teacher
router.post('/teacher/:user_id/batches', async (req, res) => {
    const { user_id } = req.params;
    const { batch_ids } = req.body;

    if (!Array.isArray(batch_ids) || !batch_ids.length) {
        return res.status(400).json({ 
            message: 'batch_ids array is required' 
        });
    }

    try {
        const assignments = batch_ids.map(batch_id => ({
            user_id,
            batch_id
        }));

        const result = await teacherBatch.bulkCreate(assignments, {
            ignoreDuplicates: true
        });

        res.status(201).json({
            message: 'Batches assigned successfully',
            assignments: result
        });
    } catch (error) {
        console.error('Error assigning batches:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ Assign multiple teachers to a batch
router.post('/batch/:batch_id/teachers', async (req, res) => {
    const { batch_id } = req.params;
    const { user_ids } = req.body;

    if (!Array.isArray(user_ids) || !user_ids.length) {
        return res.status(400).json({ 
            message: 'user_ids array is required' 
        });
    }

    try {
        const assignments = user_ids.map(user_id => ({
            batch_id,
            user_id
        }));

        const result = await teacherBatch.bulkCreate(assignments, {
            ignoreDuplicates: true
        });

        res.status(201).json({
            message: 'Teachers assigned successfully',
            assignments: result
        });
    } catch (error) {
        console.error('Error assigning teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ Remove multiple batches from a teacher
router.delete('/teacher/:user_id/batches', async (req, res) => {
    const { user_id } = req.params;
    const { batch_ids } = req.body;

    if (!Array.isArray(batch_ids) || !batch_ids.length) {
        return res.status(400).json({ 
            message: 'batch_ids array is required' 
        });
    }

    try {
        const deleted = await teacherBatch.destroy({
            where: {
                user_id,
                batch_id: {
                    [Op.in]: batch_ids
                }
            }
        });

        if (!deleted) {
            return res.status(404).json({ 
                message: 'No matching assignments found' 
            });
        }

        res.status(200).json({ 
            message: 'Batches unassigned successfully',
            count: deleted
        });
    } catch (error) {
        console.error('Error removing batches:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ Remove multiple teachers from a batch
router.delete('/batch/:batch_id/teachers', async (req, res) => {
    const { batch_id } = req.params;
    const { user_ids } = req.body;

    if (!Array.isArray(user_ids) || !user_ids.length) {
        return res.status(400).json({ 
            message: 'user_ids array is required' 
        });
    }

    try {
        const deleted = await teacherBatch.destroy({
            where: {
                batch_id,
                user_id: {
                    [Op.in]: user_ids
                }
            }
        });

        if (!deleted) {
            return res.status(404).json({ 
                message: 'No matching assignments found' 
            });
        }

        res.status(200).json({ 
            message: 'Teachers unassigned successfully',
            count: deleted
        });
    } catch (error) {
        console.error('Error removing teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
