const express = require('express');
const Attendance = require('../models/attendance'); // Import the Attendance model
const router = express.Router();
const { Op } = require('sequelize');
// Route: Fetch all attendance records
router.get('/', async (req, res) => {
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
// Route: Add multiple attendance records
router.post('/bulk', async (req, res) => {
  const { records } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'Attendance records are required' });
  }

  // Validate each record
  for (let record of records) {
    const { user_id, batch_id, subject_id, status, attendance_date } = record;

    if (!user_id || !batch_id || !subject_id || !status || !attendance_date) {
      return res.status(400).json({ message: 'User ID, Batch ID, Subject ID, Status, and Attendance Date are required for each record' });
    }
  }

  try {
    // Insert multiple attendance records at once
    const newAttendanceRecords = await Attendance.bulkCreate(records);
    res.status(201).json({
      message: 'Attendance records added successfully',
      attendance: newAttendanceRecords
    });
  } catch (error) {
    console.error('Error adding attendance records:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route: Fetch attendance by user_id
router.get('/user/:user_id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:attendance_id', async (req, res) => {
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
router.delete('/:attendance_id', async (req, res) => {
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
// Route: Get attendance for a specific batch, subject, and date
router.get('/batch/:batch_id/subject/:subject_id/date/:attendance_date', async (req, res) => {
  const { batch_id, subject_id, attendance_date } = req.params;

  if (!batch_id || !subject_id || !attendance_date) {
    return res.status(400).json({ message: 'Batch ID, Subject ID, and Attendance Date are required' });
  }

  try {
    const attendanceRecords = await Attendance.findAll({
      where: {
        batch_id,
        subject_id,
        attendance_date,
      },
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for the specified batch, subject, and date' });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance for batch, subject, and date:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/batch/:batch_id/subject/:subject_id/month/:month', async (req, res) => {
  const { batch_id, subject_id, month } = req.params;

  if (!batch_id || !subject_id || !month) {
    return res.status(400).json({ message: 'Batch ID, Subject ID, and Month are required' });
  }

  try {
    // Define start and end date for the given month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    console.log('Fetching attendance with conditions:', { batch_id, subject_id, startDate, endDate });

    const attendanceRecords = await Attendance.findAll({
      where: {
        batch_id,
        subject_id,
        attendance_date: {
          [Op.between]: [startDate, endDate] // Fetch all records in the month
        },
      },
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for the specified batch, subject, and month' });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/batch/:batch_id/month/:month', async (req, res) => {
  const { batch_id, month } = req.params;

  if (!batch_id || !month) {
    return res.status(400).json({ message: 'Batch ID and Month are required' });
  }

  try {
    // Define start and end date for the given month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    console.log('Fetching attendance with conditions:', { batch_id, startDate, endDate });

    const attendanceRecords = await Attendance.findAll({
      where: {
        batch_id,
        attendance_date: {
          [Op.between]: [startDate, endDate] // Fetch all records in the month
        },
      },
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for the specified batch and month' });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ... existing code ...
// Route: Get batch attendance subject-wise percentage of user
router.get('/batch/:batch_id/attendance_percentage', async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id) {
    return res.status(400).json({ message: 'Batch ID is required' });
  }

  try {
    const attendanceRecords = await Attendance.findAll({
      where: { batch_id },
      attributes: [
        'user_id',
        'subject_id',
        [sequelize.fn('COUNT', sequelize.col('attendance_id')), 'attendance_count'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = \'Present\' THEN 1 ELSE 0 END')), 'present_count'],
      ],
      group: ['user_id', 'subject_id'],
    });

    const percentageRecords = attendanceRecords.map(record => {
      const totalAttendance = record.attendance_count;
      const presentCount = record.present_count;
      const percentage = (presentCount / totalAttendance) * 100;
      
      return {
        user_id: record.user_id,
        subject_id: record.subject_id,
        attendance_percentage: percentage.toFixed(2),
      };
    });

    res.status(200).json(percentageRecords);
  } catch (error) {
    console.error('Error fetching batch attendance percentage:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});
// Route: Get attendance records by user_id
router.get('/user/:user_id', async (req, res) => {
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

module.exports = router;
