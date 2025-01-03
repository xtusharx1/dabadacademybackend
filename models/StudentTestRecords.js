const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Set up Sequelize connection in `config/database.js`

const StudentTestRecords = sequelize.define('StudentTestRecords', {
    record_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    marks_obtained: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'StudentTestRecords',
    timestamps: true, // Automatically handles created_at and updated_at columns
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = StudentTestRecords;
