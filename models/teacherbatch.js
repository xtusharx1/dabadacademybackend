const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const teacherBatch = sequelize.define('TeacherBatch', {
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',  // Ensure the table 'Users' exists in your DB
            key: 'user_id',
        },
        allowNull: false,
        primaryKey: true,
    },
    batch_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Batches',  // Ensure the table 'Batches' exists in your DB
            key: 'batch_id',
        },
        allowNull: false,
        primaryKey: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'TeacherBatches',
    timestamps: false,  // No automatic timestamps, you handle created_at/updated_at
});

module.exports = teacherBatch;
