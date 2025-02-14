const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Import your Sequelize instance

const TeacherReport = sequelize.define("TeacherReport", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    teacher_name: {
        type: DataTypes.STRING,  // Changed from INTEGER to STRING
        allowNull: false
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    chapter_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detailed_description: {
        type: DataTypes.TEXT
    },
    homework_assigned: {
        type: DataTypes.TEXT
    },
    is_teacher_absent: {  // Renamed from is_deleted
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true, // Automatically creates `createdAt` & `updatedAt`
    tableName: "TeacherReports"
});

module.exports = TeacherReport;
