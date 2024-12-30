const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const FeeStatus = require('./FeeStatus'); // Import FeeStatus model

const OtherChargesRecord = sequelize.define('OtherChargesRecord', {
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
  feeStatusId: {
    type: DataTypes.INTEGER,
    references: {
      model: FeeStatus,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  tableName: 'OtherChargesRecords',
  timestamps: true,  // This will automatically add 'createdAt' and 'updatedAt' fields
});

module.exports = OtherChargesRecord;
