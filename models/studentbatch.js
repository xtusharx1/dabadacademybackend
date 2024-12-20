module.exports = (sequelize, DataTypes) => {
  const StudentBatch = sequelize.define('StudentBatch', {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Assuming the Users model is already created
        key: 'user_id',
      },
      allowNull: false,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Batches', // References the Batches model
        key: 'batch_id',
      },
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
  }, {
    tableName: 'StudentBatches',
    timestamps: false,
  });

  return StudentBatch;
};
