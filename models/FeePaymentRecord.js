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
  feeStatusId: {
    type: DataTypes.INTEGER,
    references: {
      model: FeeStatus,
      key: 'id',
    },
    allowNull: false,
  },
  comments: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'FeePaymentRecords',
  timestamps: false,
});

module.exports = FeePaymentRecord;
