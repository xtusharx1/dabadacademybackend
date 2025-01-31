const express = require('express');
const Attendance = require('../models/attendance'); // Import the Attendance model
const router = express.Router();

// Route: Fetch all attendance records
router.get('/attendance', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.findAll();

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Fetch attendance by user_id
router.get('/attendance/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ message: 'Valid User ID is required' });
  }

  try {
    const attendanceRecords = await Attendance.findAll({
      where: { user_id },
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: `No attendance found for user ${user_id}` });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance for user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Add attendance record
router.post('/attendance', async (req, res) => {
  const { user_id, batch_id, subject_id, status, attendance_date, teacher_name, reason } = req.body;

  if (!user_id || !batch_id || !subject_id || !status || !attendance_date) {
    return res.status(400).json({ message: 'User ID, Batch ID, Subject ID, Status, and Attendance Date are required' });
  }

  try {
    const newAttendance = await Attendance.create({
      user_id,
      batch_id,
      subject_id,
      status,
      attendance_date,
      teacher_name,
      reason,
    });

    res.status(201).json({ message: 'Attendance recorded successfully', attendance: newAttendance });
  } catch (error) {
    console.error('Error adding attendance record:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Update attendance record
router.put('/attendance/:attendance_id', async (req, res) => {
  const { attendance_id } = req.params;
  const { status, teacher_name, reason } = req.body;

  if (!status || !['Present', 'Absent', 'Late'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (Present, Absent, or Late) is required' });
  }

  try {
    const updatedAttendance = await Attendance.update(
      { status, teacher_name, reason },
      { where: { attendance_id } }
    );

    if (!updatedAttendance[0]) {
      return res.status(404).json({ message: `Attendance record not found for ID ${attendance_id}` });
    }

    res.status(200).json({ message: 'Attendance record updated successfully' });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Delete attendance record
router.delete('/attendance/:attendance_id', async (req, res) => {
  const { attendance_id } = req.params;

  try {
    const deletedCount = await Attendance.destroy({
      where: { attendance_id },
    });

    if (!deletedCount) {
      return res.status(404).json({ message: `Attendance record not found for ID ${attendance_id}` });
    }

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
