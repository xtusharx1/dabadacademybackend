const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// FeeStatus model import can be kept if needed for the schema reference
const FeeStatus = require('./FeeStatus'); 

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
    allowNull: false,
    references: {
      model: 'FeeStatus', // Reference the FeeStatus table explicitly
      key: 'id',          // Use the primary key 'id' of FeeStatus
    },
  },
}, {
  tableName: 'OtherChargesRecords',
  timestamps: false,
});

module.exports = OtherChargesRecord;
