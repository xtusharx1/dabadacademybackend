'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add column as nullable initially
    await queryInterface.addColumn('FeeStatus', 'batch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Batches',
        key: 'batch_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 2. Backfill batch_id for existing FeeStatus records using StudentBatches
    try {
      await queryInterface.sequelize.query(`
        UPDATE "FeeStatus"
        SET "batch_id" = sb.batch_id
        FROM "StudentBatches" sb
        WHERE "FeeStatus".user_id = sb.user_id AND "FeeStatus".batch_id IS NULL;
      `);
      
      // 2.5 Fallback for dummy/test/inactive users who have no batch mapping:
      // Assign them to the first available batch in the Batches table
      await queryInterface.sequelize.query(`
        UPDATE "FeeStatus"
        SET "batch_id" = (SELECT batch_id FROM "Batches" LIMIT 1)
        WHERE "batch_id" IS NULL;
      `);
      console.log('Backfilled batch_id for all existing FeeStatus records successfully.');
    } catch (err) {
      console.error('Error backfilling batch_id for FeeStatus records:', err);
    }

    // 3. Make batch_id NOT NULL after backfilling
    await queryInterface.changeColumn('FeeStatus', 'batch_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Batches',
        key: 'batch_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 4. Add composite unique constraint
    await queryInterface.addConstraint('FeeStatus', {
      fields: ['user_id', 'batch_id'],
      type: 'unique',
      name: 'unique_user_batch_fee_status'
    });

    // 5. Add composite index for performance
    await queryInterface.addIndex('FeeStatus', ['user_id', 'batch_id'], {
      name: 'idx_feestatus_user_batch'
    });
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('FeeStatus', 'idx_feestatus_user_batch');
    } catch (err) {
      console.error('Error removing index:', err);
    }

    try {
      await queryInterface.removeConstraint('FeeStatus', 'unique_user_batch_fee_status');
    } catch (err) {
      console.error('Error removing constraint:', err);
    }

    await queryInterface.removeColumn('FeeStatus', 'batch_id');
  }
};
