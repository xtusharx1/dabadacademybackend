const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assuming your DB config is in this file

const Visit = sequelize.define('Visit', {
  visit_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schools', // Table name as a string
      key: 'school_id',
    },
  },
  personnel_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // ON DELETE SET NULL
    references: {
      model: 'marketing_personnels', // Table name as a string
      key: 'personnel_id',
    },
  },
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Active', 'Completed'),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'visits',
  timestamps: false, // Since created_at is handled manually
});

module.exports = Visit;
