const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentCounselor = sequelize.define('StudentCounselor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  c_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  s_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'StudentCounselor',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['c_id', 's_id']
    }
  ]
});

module.exports = StudentCounselor;