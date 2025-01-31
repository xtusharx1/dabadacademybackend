const express = require('express');
const Attendance = require('../models/attendance'); // Import the Attendance model
const StudentBatch = require('../models/studentbatch'); // Import the StudentBatch model
const router = express.Router();

// Route: Fetch all attendance records
router.get('/attendance', async (req, res) => {
  try {
    const attendanceData = await Attendance.findAll({
      attributes: ['user_id', 'batch_id', 'attendance_date', 'status'], // Specify fields
    });

    if (!attendanceData.length) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Fetch attendance records for a specific batch
router.get('/attendance/batch/:batch_id', async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id || isNaN(batch_id)) {
    return res.status(400).json({ message: 'Valid Batch ID is required' });
  }

  try {
    const attendanceData = await Attendance.findAll({
      where: { batch_id },
      attributes: ['user_id', 'batch_id', 'attendance_date', 'status'],
    });

    if (!attendanceData.length) {
      return res.status(404).json({ message: `No attendance records found for batch ${batch_id}` });
    }

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance records for batch:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Add attendance for a student in a specific batch
router.post('/attendance', async (req, res) => {
  const { batch_id, user_id, attendance_date, status } = req.body;

  if (!batch_id || !user_id || !attendance_date || !status || isNaN(batch_id) || isNaN(user_id)) {
    return res.status(400).json({ message: 'Batch ID, User ID, attendance date, and status are required and must be valid' });
  }

  try {
    // Check if the student exists in the batch
    const studentInBatch = await StudentBatch.findOne({ where: { batch_id, user_id } });

    if (!studentInBatch) {
      return res.status(404).json({ message: `Student ${user_id} is not part of batch ${batch_id}` });
    }

    const newAttendance = await Attendance.create({
      user_id,
      batch_id,
      attendance_date,
      status,
    });

    res.status(201).json({ message: 'Attendance added successfully', attendance: newAttendance });
  } catch (error) {
    console.error('Error adding attendance:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Update attendance for a student in a batch
router.put('/attendance', async (req, res) => {
  const { batch_id, user_id, attendance_date, status } = req.body;

  if (!batch_id || !user_id || !attendance_date || !status || isNaN(batch_id) || isNaN(user_id)) {
    return res.status(400).json({ message: 'Batch ID, User ID, attendance date, and status are required and must be valid' });
  }

  try {
    const attendanceRecord = await Attendance.findOne({
      where: { batch_id, user_id, attendance_date },
    });

    if (!attendanceRecord) {
      return res.status(404).json({ message: `Attendance record not found for student ${user_id} in batch ${batch_id} on ${attendance_date}` });
    }

    attendanceRecord.status = status;
    await attendanceRecord.save();

    res.status(200).json({ message: 'Attendance updated successfully', attendance: attendanceRecord });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Delete attendance record for a student in a batch
router.delete('/attendance', async (req, res) => {
  const { batch_id, user_id, attendance_date } = req.body;

  if (!batch_id || !user_id || !attendance_date || isNaN(batch_id) || isNaN(user_id)) {
    return res.status(400).json({ message: 'Batch ID, User ID, and attendance date are required and must be valid' });
  }

  try {
    const deletedCount = await Attendance.destroy({
      where: { batch_id, user_id, attendance_date },
    });

    if (!deletedCount) {
      return res.status(404).json({ message: `No attendance record found for student ${user_id} in batch ${batch_id} on ${attendance_date}` });
    }

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Search attendance for a student
router.get('/attendance/search/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ message: 'Valid User ID is required' });
  }

  try {
    const attendanceData = await Attendance.findAll({
      where: { user_id },
      attributes: ['user_id', 'batch_id', 'attendance_date', 'status'],
    });

    if (!attendanceData.length) {
      return res.status(404).json({ message: `No attendance records found for student ${user_id}` });
    }

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error('Error searching attendance by user ID:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
