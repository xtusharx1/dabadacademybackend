const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const FeeStatus = require('./FeeStatus');

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
  feeStatusId: {
    type: DataTypes.INTEGER,
    references: {
      model: FeeStatus,
      key: 'id',
    },
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically set the current time if not provided
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically set the current time if not provided
  },
}, {
  tableName: 'FeePaymentRecords',
  timestamps: false,  // Set to false if you don't want Sequelize to automatically manage these fields
});

module.exports = FeePaymentRecord;
