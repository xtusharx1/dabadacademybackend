const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your sequelize instance

const Attendance = sequelize.define(
  'Attendance',
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Ensure that the "Users" table exists
        key: 'user_id',
      },
      allowNull: false,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Batches', // Ensure that the "Batches" table exists
        key: 'batch_id',
      },
      allowNull: false,
    },
    attendance_date: {
      type: DataTypes.DATEONLY, // For date without time
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING, // e.g., 'Present', 'Absent', 'Late', etc.
      allowNull: false,
    },
  },
  {
    tableName: 'Attendance',
    timestamps: true, // Automatically manage created_at and updated_at
  }
);

module.exports = Attendance;
