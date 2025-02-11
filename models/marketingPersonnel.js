const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MarketingPersonnel = sequelize.define('MarketingPersonnel', {
  personnel_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'marketing_personnel',
  timestamps: false,
});

module.exports = MarketingPersonnel;
