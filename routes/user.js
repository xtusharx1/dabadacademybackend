const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Import the User model
const sequelize = require('../config/db'); // Import sequelize

const router = express.Router();

// Route to register a new user
router.post('/register', async (req, res) => {
  const { 
    name, email, password, role_id, phone_number, date_of_admission, 
    present_class, date_of_birth, total_course_fees, father_name, 
    mother_name, full_address, child_aadhar_number, mother_aadhar_number, 
    father_aadhar_number, permanent_education_number, student_registration_number, 
    previous_school_info 
  } = req.body;

  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ message: 'Please provide name, email, password, and role_id' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if the phone number already exists
    if (phone_number) {
      const phoneExists = await User.findOne({ where: { phone_number } });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password_hash: hashedPassword,
      role_id,
      phone_number,
      date_of_admission,
      present_class,
      date_of_birth,
      total_course_fees,
      father_name,
      mother_name,
      full_address,
      child_aadhar_number,
      mother_aadhar_number,
      father_aadhar_number,
      permanent_education_number,
      student_registration_number,
      previous_school_info,
    };

    // Create a new user
    const createdUser = await User.create(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: createdUser.user_id, name: createdUser.name, email: createdUser.email, phone_number: createdUser.phone_number },
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to get user details by user_id
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: 'Please provide a user_id' });
  }

  try {
    // Fetch the user by user_id
    const user = await User.findOne({
      where: { user_id },
    });

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    res.status(200).json({ user: { id: user.user_id, name: user.name, email: user.email, phone_number: user.phone_number } });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get users by role_id
router.get('/role/:role_id', async (req, res) => {
  const { role_id } = req.params;

  if (!role_id) {
    return res.status(400).json({ message: 'Please provide a role_id' });
  }

  try {
    const usersByRole = await User.findAll({
      where: { role_id },
      attributes: ['user_id', 'name', 'email', 'phone_number'], // Include phone_number
    });

    if (usersByRole.length === 0) {
      return res.status(404).json({ message: `No users found for role_id ${role_id}` });
    }

    res.status(200).json(usersByRole);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get user counts by role_id
router.get('/roles/count', async (req, res) => {
  try {
    const roleCounts = await User.findAll({
      attributes: [
        'role_id',
        [sequelize.fn('COUNT', sequelize.col('role_id')), 'count'],
      ],
      group: ['role_id'],
    });

    const totalUsers = await User.count();

    const result = roleCounts.map(role => ({
      role_id: role.role_id,
      count: role.dataValues.count,
    }));

    result.push({ total_users: totalUsers });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching role counts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to log in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.user_id, name: user.name, email: user.email, phone_number: user.phone_number },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'name', 'email', 'phone_number'], // Include phone_number
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
