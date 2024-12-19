const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Import the User model
const sequelize = require('../config/db'); // Import sequelize

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role_id, date_of_admission, present_class, date_of_birth, total_course_fees, father_name, mother_name, full_address, child_aadhar_number, mother_aadhar_number, father_aadhar_number, permanent_education_number, student_registration_number, previous_school_info } = req.body;

if (!name || !email || !password || !role_id) {
  return res.status(400).json({ message: 'Please provide name, email, password, and role_id' });
}

const userExists = await User.findOne({ where: { email } });
if (userExists) {
  return res.status(400).json({ message: 'User already exists' });
}

// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);

const newUser = {
  name,
  email,
  password_hash: hashedPassword, // Ensure the field matches the model name
  role_id,
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

try {
  const createdUser = await User.create(newUser);
  res.status(201).json({ message: 'User registered successfully', user: { id: createdUser.user_id, name: createdUser.name, email: createdUser.email } });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}

});
// Route to get users by role_id, including role details
router.get('/role/:role_id', async (req, res) => {
  const { role_id } = req.params;

  if (!role_id) {
    return res.status(400).json({ message: 'Please provide a role_id' });
  }

  try {
    const usersByRole = await User.findAll({
      where: { role_id } // Filter users by role_id
    });

    if (usersByRole.length === 0) {
      return res.status(404).json({ message: `No users found for role_id ${role_id}` });
    }

    // Return users without the role details
    res.status(200).json(usersByRole);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/roles/count', async (req, res) => {
  try {
    // First, get the count of users per role
    const roleCounts = await User.findAll({
      attributes: [
        'role_id',
        [sequelize.fn('COUNT', sequelize.col('role_id')), 'count'],
      ],
      group: ['role_id'], // Group by role_id
    });

    // Second, get the total count of users
    const totalUsers = await User.count();

    // Map the roleCounts to return the role_id and user count
    const result = roleCounts.map(role => ({
      role_id: role.role_id,
      count: role.dataValues.count,
    }));

    // Add the total user count to the response
    result.push({ total_users: totalUsers });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching role counts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




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
      user: { id: user.user_id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
