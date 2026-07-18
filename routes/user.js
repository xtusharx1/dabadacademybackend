const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

const router = express.Router();

// User registration endpoint with validation

router.post('/register', async (req, res) => {
  try {
    let {
      name, email, password, role_id, phone_number, date_of_admission,
      present_class, date_of_birth, total_course_fees, father_name,
      mother_name, full_address, child_aadhar_number, mother_aadhar_number,
      father_aadhar_number, permanent_education_number, student_registration_number,
      previous_school_info, gender, state, status = 'active'
    } = req.body;

    if (email) email = email.trim().toLowerCase();

    // Manual validation for required fields
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: [
          { field: 'name', message: !name ? 'Name is required' : null },
          { field: 'email', message: !email ? 'Email is required' : null },
          { field: 'password', message: !password ? 'Password is required' : null },
          { field: 'role_id', message: !role_id ? 'Role ID is required' : null }
        ].filter(error => error.message !== null)
      });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password length validation
    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists (case-insensitive to support legacy mixed-case)
    const userExists = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        email
      )
    });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if phone number is already in use (if provided)
    if (phone_number) {
      const phoneExists = await User.findOne({ where: { phone_number } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set current timestamp for created_at and updated_at
    const currentTime = new Date();

    // Prepare user data aligned with the model
    const newUser = {
      name,
      email,
      password_hash: hashedPassword,
      role_id: parseInt(role_id),
      phone_number: phone_number || null,
      date_of_admission: date_of_admission || null,
      present_class: present_class || null,
      date_of_birth: date_of_birth || null,
      total_course_fees: total_course_fees ? parseFloat(total_course_fees) : null,
      father_name: father_name || null,
      mother_name: mother_name || null,
      full_address: full_address || null,
      child_aadhar_number: child_aadhar_number || null,
      mother_aadhar_number: mother_aadhar_number || null,
      father_aadhar_number: father_aadhar_number || null,
      permanent_education_number: permanent_education_number || null,
      student_registration_number: student_registration_number || null,
      previous_school_info: previous_school_info || null,
      gender: gender || null,
      state: state || null,
      status,
      created_at: currentTime,
      updated_at: currentTime
    };

    // Create the new user
    const createdUser = await User.create(newUser);

    // Return success response with user details
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: createdUser.user_id,
        name: createdUser.name,
        email: createdUser.email,
        role_id: createdUser.role_id,
        phone_number: createdUser.phone_number,
        status: createdUser.status,
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error);

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A user with this information already exists',
        error: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    // General server error
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});
// Update user by user_id
router.put('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Log incoming request
    console.log(`Received update request for user_id: ${user_id}`);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    // Validate user_id
    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Fetch user by user_id
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    // Get existing user data
    const existingData = user.toJSON();

    // Extract fields from request body
    const {
      name = existingData.name,
      email = existingData.email,
      role_id,
      phone_number = existingData.phone_number,
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
      gender,
      state,
      status = existingData.status,
      password,
      password_hash,
    } = req.body;

    let normalizedEmail = email;
    if (normalizedEmail) normalizedEmail = normalizedEmail.trim().toLowerCase();

    // Skip basic validation for required fields when updating
    // since we're using existing values as defaults

    // Prepare updated fields - only include fields that are present in the request
    const updatedFields = {};

    // Process each field only if it exists in the request body
    if (req.body.hasOwnProperty('name')) updatedFields.name = name;
    if (req.body.hasOwnProperty('email')) updatedFields.email = normalizedEmail;
    if (req.body.hasOwnProperty('role_id')) updatedFields.role_id = role_id;
    if (req.body.hasOwnProperty('phone_number')) updatedFields.phone_number = phone_number;
    if (req.body.hasOwnProperty('date_of_admission')) updatedFields.date_of_admission = date_of_admission;
    if (req.body.hasOwnProperty('present_class')) updatedFields.present_class = present_class;
    if (req.body.hasOwnProperty('date_of_birth')) updatedFields.date_of_birth = date_of_birth;
    if (req.body.hasOwnProperty('total_course_fees')) {
      updatedFields.total_course_fees = total_course_fees !== null && total_course_fees !== undefined
        ? parseFloat(total_course_fees)
        : null;
    }
    if (req.body.hasOwnProperty('father_name')) updatedFields.father_name = father_name;
    if (req.body.hasOwnProperty('mother_name')) updatedFields.mother_name = mother_name;
    if (req.body.hasOwnProperty('full_address')) updatedFields.full_address = full_address;
    if (req.body.hasOwnProperty('child_aadhar_number')) updatedFields.child_aadhar_number = child_aadhar_number;
    if (req.body.hasOwnProperty('mother_aadhar_number')) updatedFields.mother_aadhar_number = mother_aadhar_number;
    if (req.body.hasOwnProperty('father_aadhar_number')) updatedFields.father_aadhar_number = father_aadhar_number;
    if (req.body.hasOwnProperty('permanent_education_number')) updatedFields.permanent_education_number = permanent_education_number;
    if (req.body.hasOwnProperty('student_registration_number')) updatedFields.student_registration_number = student_registration_number;
    if (req.body.hasOwnProperty('previous_school_info')) updatedFields.previous_school_info = previous_school_info;
    if (req.body.hasOwnProperty('gender')) updatedFields.gender = gender;
    if (req.body.hasOwnProperty('state')) updatedFields.state = state;
    if (req.body.hasOwnProperty('status')) updatedFields.status = status;

    // Determine the password to use (prioritize 'password' but fallback to 'password_hash' for legacy admin panels)
    let passwordInput = password || password_hash;
    

    if (passwordInput) {
      // Prevent double hashing if the input is already a bcrypt hash
      if (passwordInput.startsWith('$2a$') || passwordInput.startsWith('$2b$') || passwordInput.startsWith('$2y$')) {
        return res.status(400).json({ message: 'Directly storing hashes or double-hashing is not allowed. Please provide a plain-text password.' });
      }
      try {
        console.log("Password provided, hashing...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(passwordInput, saltRounds);
        updatedFields.password_hash = hashedPassword;
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ message: 'Error processing password' });
      }
    }

    console.log("Updating user with the following fields:", Object.keys(updatedFields));

    // Validate that we have at least one field to update
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Update user fields in the database
    try {
      const updatedUser = await user.update(updatedFields);

      res.status(200).json({
        message: 'User updated successfully',
        user: {
          id: updatedUser.user_id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          status: updatedUser.status,
        },
      });
    } catch (updateError) {
      console.error('Database update error:', updateError);

      // Check for specific database errors
      if (updateError.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Unique constraint violation',
          error: updateError.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }

      if (updateError.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          error: updateError.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }

      throw updateError; // Re-throw for general error handling
    }

  } catch (error) {
    console.error('Error updating user:', error);

    // Return appropriate error response based on error type
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ message: 'Database connection error', error: error.message });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Add a new route specifically for password change
router.put('/user/:user_id/change-password', async (req, res) => {
  const { user_id } = req.params;
  const { new_password } = req.body;

  try {
    // Log incoming request
    console.log(`Received password change request for user_id: ${user_id}`);

    // Validate user_id
    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Validate new password
    if (!new_password) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Fetch user by user_id
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update only the password
    await user.update({ password_hash: hashedPassword });

    res.status(200).json({
      message: 'Password changed successfully',
      user_id: user.user_id
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({
      where: { user_id },
      attributes: [
        'user_id',
        'name',
        'email',
        'role_id',
        'phone_number',
        'date_of_admission',
        'present_class',
        'date_of_birth',
        'total_course_fees',
        'father_name',
        'mother_name',
        'full_address',
        'child_aadhar_number',
        'mother_aadhar_number',
        'father_aadhar_number',
        'permanent_education_number',
        'student_registration_number',
        'previous_school_info',
        'gender',
        'state',
        'status',
      ],
    });

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
router.get('/user/phone/:phone_number', async (req, res) => {
  const { phone_number } = req.params;

  try {
    const user = await User.findOne({
      where: { phone_number },
      attributes: [
        'user_id',
        'name',
        'email',
        'role_id',
        'phone_number',
        'date_of_admission',
        'present_class',
        'date_of_birth',
        'total_course_fees',
        'father_name',
        'mother_name',
        'full_address',
        'child_aadhar_number',
        'mother_aadhar_number',
        'father_aadhar_number',
        'permanent_education_number',
        'student_registration_number',
        'previous_school_info',
        'gender',
        'state',
        'status',
      ],
    });

    if (!user) {
      return res.status(404).json({ message: `User with phone number ${phone_number} not found` });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get users by role_id
router.get('/role/:role_id', async (req, res) => {
  const { role_id } = req.params;

  try {
    const usersByRole = await User.findAll({
      where: { role_id },
      attributes: ['user_id', 'name', 'email', 'phone_number', 'status', 'created_at', 'date_of_admission'], // Include created_at
      order: [
        ['status', 'ASC'],  // 🏆 Active ("active") first, inactive ("inactive") below
        ['created_at', 'DESC'] // 📅 Sort by created_at (latest first) within each status
      ],
    });

    if (usersByRole.length === 0) {
      return res.status(404).json({ message: `No users found for role_id ${role_id}` });
    }

    res.status(200).json(usersByRole);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get active users by role_id
router.get('/active/role/:role_id', async (req, res) => {
  const { role_id } = req.params;

  try {
    const activeUsers = await User.findAll({
      where: { role_id, status: "active" },
      attributes: ['user_id', 'name', 'email', 'phone_number', 'status', 'created_at', 'date_of_admission'],
      order: [['created_at', 'DESC']], // Sort by created_at in descending order
    });

    if (activeUsers.length === 0) {
      return res.status(404).json({ message: `No active users found for role_id ${role_id}` });
    }

    res.status(200).json(activeUsers);
  } catch (error) {
    console.error('Error fetching active users by role:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get admission date and total course fee by user_id
router.get('/admissions/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({
      where: { user_id },
      attributes: ['user_id', 'name', 'date_of_admission', 'total_course_fees'], // Select only required fields
    });

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching admission data for user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Get user counts by role_id and status
router.get('/roles/count', async (req, res) => {
  try {
    // Fetch the counts of users by role_id, with status = 'active'
    const roleCounts = await User.findAll({
      attributes: [
        'role_id',
        [sequelize.fn('COUNT', sequelize.col('role_id')), 'count'],
      ],
      where: { status: 'active' },  // Only count users where status is 'active'
      group: ['role_id'],  // Group by role_id
    });

    // Fetch the total count of active users
    const totalUsers = await User.count({
      where: { status: 'active' },  // Only count users with status 'active'
    });

    // Construct the result to have one entry for each role_id, with the count of active users
    const result = roleCounts.map(role => ({
      role_id: role.role_id,
      count: role.dataValues.count,
    }));

    result.push({ total_users: totalUsers });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching role counts:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  email = email.trim().toLowerCase();

  try {
    // Find user by email (case-insensitive to support mixed-case legacy records)
    const user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        email
      )
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Your account is inactive. Please contact the admin to activate your account.',
      });
    }

    // Compare password with fallback for legacy plain-text passwords
    let isMatch = false;

    if (user.password_hash && (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2y$'))) {
      // Valid bcrypt hash format
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy unhashed plain-text password detected in DB
      if (user.password_hash === password) {
        isMatch = true;
        // Auto-upgrade to bcrypt hash
        try {
          const newHash = await bcrypt.hash(password, 10);
          await user.update({ password_hash: newHash });
          console.log(`Auto-upgraded plain-text password to bcrypt hash for user ${user.email}`);
        } catch (upgradeErr) {
          console.error("Failed to auto-upgrade password for user", user.email, upgradeErr);
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user details with role_id
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role_id: user.role_id, // Include role_id in the response
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get birthdays of active students
router.get('/birthdays', async (req, res) => {
  try {
    const students = await User.findAll({
      where: {
        role_id: 2,
        status: 'active',
        date_of_birth: {
          [Op.ne]: null
        }
      },
      attributes: ['user_id', 'name', 'email', 'phone_number', 'date_of_birth', 'present_class', 'profile_picture']
    });

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const formattedStudents = students.map(student => {
      const dob = new Date(student.date_of_birth);
      if (isNaN(dob.getTime())) return null;

      const dobMonth = dob.getMonth();
      const dobDay = dob.getDate();
      const dobYear = dob.getFullYear();

      // Formatted DOB (e.g. 19-July-2012)
      const formattedDob = `${dobDay.toString().padStart(2, '0')}-${months[dobMonth]}-${dobYear}`;

      // Calculate next birthday date
      let nextBday = new Date(currentYear, dobMonth, dobDay);
      nextBday.setHours(0, 0, 0, 0);

      const isLeap = (yr) => (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);

      // Handle leap year edge case (Feb 29 on a non-leap year)
      if (dobMonth === 1 && dobDay === 29) {
        if (!isLeap(currentYear)) {
          nextBday = new Date(currentYear, 1, 28);
        }
      }

      // If birthday already passed this year, set for next year
      if (nextBday < today) {
        nextBday = new Date(currentYear + 1, dobMonth, dobDay);
        if (dobMonth === 1 && dobDay === 29) {
          if (!isLeap(currentYear + 1)) {
            nextBday = new Date(currentYear + 1, 1, 28);
          }
        }
      }

      // Calculate age
      let age = currentYear - dobYear;
      const bdayThisYear = new Date(currentYear, dobMonth, dobDay);
      if (today < bdayThisYear) {
        age -= 1;
      }

      // Calculate days remaining
      const diffMs = nextBday.getTime() - today.getTime();
      const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const formattedNextBday = `${nextBday.getDate().toString().padStart(2, '0')}-${months[nextBday.getMonth()]}-${nextBday.getFullYear()}`;

      return {
        user_id: student.user_id,
        name: student.name,
        email: student.email,
        phone_number: student.phone_number,
        present_class: student.present_class,
        profile_picture: student.profile_picture,
        date_of_birth: student.date_of_birth,
        formattedDob,
        nextBirthday: nextBday.toISOString().split('T')[0],
        formattedNextBirthday: formattedNextBday,
        age: age < 0 ? 0 : age,
        daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
        isToday: daysRemaining === 0
      };
    }).filter(Boolean);

    // Sort by daysRemaining ascending (Today's birthdays first, then upcoming, then past birthdays next year)
    formattedStudents.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.status(200).json(formattedStudents);
  } catch (error) {
    console.error('Error fetching student birthdays:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
