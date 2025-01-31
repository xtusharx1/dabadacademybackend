const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your sequelize instance

const Attendance = sequelize.define(
  'Attendance',
  {
    attendance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically generate the next value
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the Users table
        key: 'user_id',
      },
      allowNull: false,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Batches', // Name of the Batches table
        key: 'batch_id',
      },
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Subjects', // Name of the Subjects table
        key: 'subject_id',
      },
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        isIn: [['Present', 'Absent', 'Late']],
      },
    },
    attendance_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    teacher_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Attendance', // Ensure this matches the database table name
    timestamps: false, // Disable automatic timestamps since created_at is already in the schema
  }
);

module.exports = Attendance;
