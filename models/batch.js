const sequelize = require('../config/db'); // Importing sequelize from your config file
const { DataTypes } = require('sequelize'); // Destructure DataTypes from sequelize

module.exports = sequelize.define('Batch', {
  batch_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  batch_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // By default, the batch is active
    allowNull: false,
  },
}, {
  tableName: 'Batches',
  timestamps: false,
});
