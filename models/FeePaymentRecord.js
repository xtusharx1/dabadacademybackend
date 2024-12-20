const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const FeeStatus = require('./FeeStatus'); // Import FeeStatus model

const FeePaymentRecord = sequelize.define('FeePaymentRecord', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  feeStatusId: { // Foreign key to FeeStatus
    type: DataTypes.INTEGER,
    references: {
      model: FeeStatus, // Reference the FeeStatus model
      key: 'id', // Primary key in FeeStatus
    },
    allowNull: false,
  },
}, {
  tableName: 'FeePaymentRecords',
  timestamps: false,
});

module.exports = FeePaymentRecord;
