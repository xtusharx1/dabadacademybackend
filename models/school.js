const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assuming your DB config is in this file

const School = sequelize.define('School', {
  school_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  school_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'schools',
  timestamps: false, // Since created_at is handled manually
});

module.exports = School;
