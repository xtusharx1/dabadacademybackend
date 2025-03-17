const express = require('express');
const router = express.Router();
const StudentCounselor = require('../models/studentCounselor');

/**
 * @route   POST /api/student-counselor
 * @desc    Assign a counselor to a student
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { c_id, s_id } = req.body;

    if (!c_id || !s_id) {
      return res.status(400).json({ message: 'Counselor ID and Student ID are required' });
    }

    // Check if the assignment already exists
    const existingAssignment = await StudentCounselor.findOne({
      where: { c_id, s_id }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'This student is already assigned to this counselor' });
    }

    const assignment = await StudentCounselor.create({
      c_id,
      s_id
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning counselor to student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/student-counselor
 * @desc    Get all student-counselor assignments
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const assignments = await StudentCounselor.findAll();
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching student-counselor assignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/student-counselor/counselor/:id
 * @desc    Get all students assigned to a specific counselor
 * @access  Private
 */
router.get('/counselor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assignments = await StudentCounselor.findAll({
      where: { c_id: id }
    });
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching students for counselor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/student-counselor/student/:id
 * @desc    Get counselor assigned to a specific student
 * @access  Private
 */
router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await StudentCounselor.findOne({
      where: { s_id: id }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'No counselor assigned to this student' });
    }
    
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching counselor for student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/student-counselor
 * @desc    Remove a counselor-student assignment
 * @access  Private
 */
router.delete('/', async (req, res) => {
  try {
    const { c_id, s_id } = req.body;
    
    if (!c_id || !s_id) {
      return res.status(400).json({ message: 'Counselor ID and Student ID are required' });
    }
    
    const deleted = await StudentCounselor.destroy({
      where: { c_id, s_id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.status(200).json({ message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('Error removing student-counselor assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;