const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assuming your DB config is in this file

const MarketingPersonnel = sequelize.define('MarketingPersonnel', {
  personnel_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'marketing_personnels',
  timestamps: false, // Since created_at is handled manually
});

module.exports = MarketingPersonnel;
