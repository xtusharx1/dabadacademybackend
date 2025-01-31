const express = require('express');
const router = express.Router();
const { Attendance, Subjects } = require('../models/attendance');  // Import your models

// Create a new attendance record
router.post('/', async (req, res) => {
  try {
    const { user_id, batch_id, subject_id, status, attendance_date, teacher_name } = req.body;

    // Create a new attendance entry
    const attendance = await Attendance.create({
      user_id,
      batch_id,
      subject_id,
      status,
      attendance_date,
      teacher_name  // Add teacher_name field
    });

    res.status(201).json({ message: 'Attendance record created successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating attendance record' });
  }
});

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.findAll({
      include: [{ model: Subjects, attributes: ['subject_name'] }],
      attributes: ['attendance_id', 'user_id', 'batch_id', 'subject_id', 'status', 'attendance_date', 'teacher_name'],  // Include teacher_name in the response
    });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get attendance records by user_id
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const attendanceRecords = await Attendance.findAll({
      where: { user_id },
      include: [{ model: Subjects, attributes: ['subject_name'] }],
      attributes: ['attendance_id', 'user_id', 'batch_id', 'subject_id', 'status', 'attendance_date', 'teacher_name'],  // Include teacher_name in the response
    });
    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this user' });
    }
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Update an attendance record by attendance_id
router.put('/:attendance_id', async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { user_id, batch_id, subject_id, status, attendance_date, teacher_name } = req.body;

    const attendance = await Attendance.findByPk(attendance_id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update the attendance record
    attendance.user_id = user_id || attendance.user_id;
    attendance.batch_id = batch_id || attendance.batch_id;
    attendance.subject_id = subject_id || attendance.subject_id;
    attendance.status = status || attendance.status;
    attendance.attendance_date = attendance_date || attendance.attendance_date;
    attendance.teacher_name = teacher_name || attendance.teacher_name;  // Update teacher_name

    await attendance.save();

    res.status(200).json({ message: 'Attendance record updated successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating attendance record' });
  }
});

// Delete an attendance record by attendance_id
router.delete('/:attendance_id', async (req, res) => {
  try {
    const { attendance_id } = req.params;

    const attendance = await Attendance.findByPk(attendance_id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Delete the attendance record
    await attendance.destroy();

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting attendance record' });
  }
});

// Get batch attendance subject-wise
router.get('/batch/:batch_id', async (req, res) => {
  try {
    const { batch_id } = req.params;

    // Fetch attendance records for the batch, grouped by subject
    const attendanceRecords = await Attendance.findAll({
      where: { batch_id },
      include: [{ model: Subjects, attributes: ['subject_name'] }],
      attributes: ['attendance_id', 'user_id', 'batch_id', 'subject_id', 'status', 'attendance_date', 'teacher_name'],  // Include teacher_name in the response
    });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this batch' });
    }

    // Group attendance records by subject_name
    const groupedBySubject = attendanceRecords.reduce((acc, record) => {
      const subjectName = record.Subject.subject_name;
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(record);
      return acc;
    }, {});

    res.status(200).json(groupedBySubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching batch attendance records' });
  }
});

// Get attendance for a specific batch, subject, and date
router.get('/batch/:batch_id/subject/:subject_id/date/:date', async (req, res) => {
  try {
    const { batch_id, subject_id, date } = req.params;

    // Fetch attendance records for the specific batch, subject, and date
    const attendanceRecords = await Attendance.findAll({
      where: {
        batch_id,
        subject_id,
        attendance_date: date,  // Filter by the provided date (in YYYY-MM-DD format)
      },
      include: [{ model: Subjects, attributes: ['subject_name'] }],
      attributes: ['attendance_id', 'user_id', 'batch_id', 'subject_id', 'status', 'attendance_date', 'teacher_name'],  // Include teacher_name in the response
    });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this batch, subject, and date' });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

module.exports = router;
