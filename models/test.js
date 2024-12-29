const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Set up Sequelize connection in `config/database.js`

const Test = sequelize.define('Test', {
    test_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    test_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_marks: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Test',
    timestamps: false,
});

module.exports = Test;
