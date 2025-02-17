const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your sequelize instance

const SubjectTeacher = sequelize.define('SubjectTeacher', {
    subject_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Subjects',
            key: 'subject_id'
        },
        onDelete: 'CASCADE'
    },
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'SubjectTeachers',
    timestamps: false,  // Since we're using assigned_at instead
    schema: 'public'    // Explicitly set the schema
});

module.exports = SubjectTeacher;
  