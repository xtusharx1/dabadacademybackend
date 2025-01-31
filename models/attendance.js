module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    attendance_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Subjects',
        key: 'subject_id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Late"),
      allowNull: false,
    },
    attendance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    teacher_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,  // Optional field for absence or late status
    },
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Subjects, { foreignKey: 'subject_id' });
  };

  return Attendance;
};
