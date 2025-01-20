const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FeeStatus = sequelize.define('FeeStatus', {
  admissionDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalFees: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  feesSubmitted: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remainingFees: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nextDueDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: { // Foreign key column for User
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Refers to the 'Users' table
      key: 'user_id', // Refers to the 'user_id' column in the 'Users' table
    },
    onDelete: 'CASCADE', // Deletes FeeStatus entries if the referenced User is deleted
  },
  paymentCompleted: { // New column to track payment completion status
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default value is false, indicating payment is not completed
    allowNull: false,
  },
}, {
  tableName: 'FeeStatus',
  timestamps: false,
});

module.exports = FeeStatus;
