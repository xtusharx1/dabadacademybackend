const express = require('express');
const router = express.Router();
const StudentTestRecords = require('../models/StudentTestRecords');

// Create a new student test record
router.post('/', async (req, res) => {
    try {
        const { test_id, user_id, marks_obtained } = req.body;
        const newRecord = await StudentTestRecords.create({ test_id, user_id, marks_obtained });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get student details for a specific test
router.get('/students/test/:test_id', async (req, res) => {
    const { test_id } = req.params;
  
    if (!test_id || isNaN(test_id)) {
      return res.status(400).json({ message: 'Valid Test ID is required' });
    }
  
    try {
      const studentRecords = await StudentTestRecords.findAll({
        where: { test_id },
        attributes: ['record_id', 'user_id', 'marks_obtained'], // Fetch relevant fields
      });
  
      if (!studentRecords.length) {
        return res.status(404).json({ message: `No students found for test ${test_id}` });
      }
  
      // If records found, we can fetch the student details (you might have a separate Student model for this)
      const studentDetails = await Promise.all(
        studentRecords.map(async (record) => {
          // Assuming you have a `Student` model to fetch student details
          const student = await Student.findByPk(record.user_id, {
            attributes: ['user_id', 'name', 'email'], // Adjust attributes as necessary
          });
          return {
            student: student,
            marks_obtained: record.marks_obtained,
          };
        })
      );
  
      res.status(200).json(studentDetails);
    } catch (error) {
      console.error('Error fetching student details for test:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
// Get all student test records
router.get('/', async (req, res) => {
    try {
        const records = await StudentTestRecords.findAll();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student test records by test_id
router.get('/test/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        // Fetch student test records based on test_id
        const records = await StudentTestRecords.findAll({
            where: { test_id: test_id },
            attributes: ['record_id', 'test_id', 'user_id', 'marks_obtained'] // Fetch only required fields
        });

        if (records.length > 0) {
            // Send the records with only the required attributes
            res.json(records);
        } else {
            res.status(404).json({ message: 'No records found for this test.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Edit a student test record
router.put('/:record_id', async (req, res) => {
    try {
        const { record_id } = req.params;
        const { test_id, user_id, marks_obtained } = req.body;

        // Find the record to update
        const record = await StudentTestRecords.findByPk(record_id);
        
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Update the record
        const updatedRecord = await record.update({
            test_id,
            user_id,
            marks_obtained
        });

        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
