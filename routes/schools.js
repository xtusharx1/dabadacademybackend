const express = require('express');
const router = express.Router();
const School = require('../models/school'); // Check the filename is exactly "school.js"


// Get all schools
router.get('/', async (req, res) => {
    try {
      const schools = await School.findAll();
      res.status(200).json({ data: schools });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schools', error: error.message });
    }
  });

// Get school by ID
router.get('/:id', async (req, res) => {
    try {
        const school = await School.findByPk(req.params.id);
        if (!school) return res.status(404).json({ message: 'School not found' });
        res.json(school);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching school', error });
    }
});

// Create a new school
router.post('/', async (req, res) => {
    try {
        const schools = req.body.schools; // Expecting an array of school objects
        if (!Array.isArray(schools) || schools.length === 0) {
            return res.status(400).json({ message: 'Invalid input, expected an array of schools' });
        }

        const newSchools = await School.bulkCreate(schools);
        res.json(newSchools);
    } catch (error) {
        res.status(500).json({ message: 'Error adding schools', error });
    }
});

// Update a school
router.put('/:id', async (req, res) => {
    try {
        const { school_name, lat, lng } = req.body;
        const updated = await School.update({ school_name, lat, lng }, { where: { school_id: req.params.id } });
        if (!updated[0]) return res.status(404).json({ message: 'School not found' });
        res.json({ message: 'School updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating school', error });
    }
});

// Delete a school
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await School.destroy({ where: { school_id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'School not found' });
        res.json({ message: 'School deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting school', error });
    }
});

module.exports = router;
