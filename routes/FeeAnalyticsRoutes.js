// Read-only fee analytics for the admin panel's Fee Dashboard and Collections pages.
// Only SELECT queries on the existing fee, batch and user tables; nothing is written.
const express = require('express');
const sequelize = require('../config/db');
const { todayIST, dashboard, collections } = require('../services/feeAnalytics');

const router = express.Router();

// Fee rows for one batch, or for all active batches
async function loadData(batchId, withPayments) {
  const scope = batchId
    ? { where: 'f.batch_id = :batchId', replacements: { batchId: parseInt(batchId, 10) } }
    : { where: 'b.is_active = true', replacements: {} };

  const statuses = await sequelize.query(
    `SELECT f.id, f.user_id, f.batch_id, f."totalFees", f."feesSubmitted", f."remainingFees",
            f."nextDueDate", f."paymentCompleted", b.batch_name, u.name, u.phone_number
       FROM "FeeStatus" f
       JOIN "Batches" b ON b.batch_id = f.batch_id
       LEFT JOIN "Users" u ON u.user_id = f.user_id
      WHERE ${scope.where}`,
    { replacements: scope.replacements, type: sequelize.QueryTypes.SELECT },
  );
  if (!withPayments) return { statuses };

  const ids = statuses.map((s) => s.id);
  if (!ids.length) return { statuses, payments: [], charges: [] };
  const payments = await sequelize.query(
    'SELECT "feeStatusId", title, date, amount FROM "FeePaymentRecords" WHERE "feeStatusId" IN (:ids)',
    { replacements: { ids }, type: sequelize.QueryTypes.SELECT },
  );
  const charges = await sequelize.query(
    'SELECT "feeStatusId", title, amount FROM "OtherChargesRecords" WHERE "feeStatusId" IN (:ids)',
    { replacements: { ids }, type: sequelize.QueryTypes.SELECT },
  );
  return { statuses, payments, charges };
}

// Active batches for the batch filter
router.get('/batches', async (req, res) => {
  try {
    const rows = await sequelize.query(
      'SELECT batch_id, batch_name FROM "Batches" WHERE is_active = true ORDER BY batch_name',
      { type: sequelize.QueryTypes.SELECT },
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const data = await loadData(req.query.batch_id, true);
    res.json(dashboard(data, todayIST()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/collections', async (req, res) => {
  try {
    const data = await loadData(req.query.batch_id, false);
    res.json(collections(data, todayIST()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
