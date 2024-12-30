const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  date_of_admission: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  present_class: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  total_course_fees: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  father_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mother_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  full_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  child_aadhar_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mother_aadhar_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  father_aadhar_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permanent_education_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  student_registration_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previous_school_info: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Batches', // Reference to the Batches table
      key: 'batch_id', // Ensure this matches the primary key in the Batches table
    },
    onDelete: 'SET NULL', // Set batch_id to NULL if the batch is deleted
    onUpdate: 'CASCADE', // Update batch_id in Users if it changes in Batches
  },
}, {
  tableName: 'Users',
  timestamps: false,
});

module.exports = User;
