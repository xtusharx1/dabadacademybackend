const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your sequelize instance

const TeacherBatch = sequelize.define(
  'TeacherBatch',
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the Users table
        key: 'user_id',
      },
      allowNull: false,
      primaryKey: true, // Set as part of the composite primary key
    },
    batch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Batches', // Name of the Batches table
        key: 'batch_id',
      },
      allowNull: false,
      primaryKey: true, // Set as part of the composite primary key
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'TeacherBatches', // Ensure this matches the database table name
    timestamps: false, // Disable automatic timestamps
  }
);

module.exports = TeacherBatch;
