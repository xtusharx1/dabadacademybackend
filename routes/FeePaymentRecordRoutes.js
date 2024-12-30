const express = require('express');
const router = express.Router();
const FeePaymentRecord = require('../models/FeePaymentRecord');
const FeeStatus = require('../models/FeeStatus');

// Add a payment record
router.post('/add-payment', async (req, res) => {
    try {
        const { title, date, amount, feeStatusId } = req.body;

        // Create a new payment record
        const newPayment = await FeePaymentRecord.create({ title, date, amount, feeStatusId });

        // Update FeeStatus: Add payment to feesSubmitted and recalculate remainingFees
        const feeStatus = await FeeStatus.findByPk(feeStatusId);

        if (!feeStatus) {
            return res.status(404).json({ error: 'FeeStatus not found' });
        }

        const updatedFeesSubmitted = parseFloat(feeStatus.feesSubmitted) + parseFloat(amount);
        const updatedRemainingFees = parseFloat(feeStatus.totalFees) - updatedFeesSubmitted;

        await feeStatus.update({
            feesSubmitted: updatedFeesSubmitted.toFixed(2),
            remainingFees: updatedRemainingFees.toFixed(2),
        });

        res.status(201).json({ message: 'Payment added successfully', newPayment, feeStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all payment records for a student
router.get('/payments/:feeStatusId', async (req, res) => {
    try {
        const { feeStatusId } = req.params;

        const payments = await FeePaymentRecord.findAll({
            where: { feeStatusId },
        });

        if (!payments.length) {
            return res.status(404).json({ error: 'No payment records found' });
        }

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
