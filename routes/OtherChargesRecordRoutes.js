const express = require('express');
const router = express.Router();
const OtherChargesRecord = require('../models/OtherChargesRecord');
const FeeStatus = require('../models/FeeStatus');

// Add other charges
router.post('/add-other-charges', async (req, res) => {
    try {
        const { title, date, amount, feeStatusId } = req.body;

        // Create a new charge record
        const newCharge = await OtherChargesRecord.create({ title, date, amount, feeStatusId });

        // Update FeeStatus: Add charge to totalFees and recalculate remainingFees
        const feeStatus = await FeeStatus.findByPk(feeStatusId);

        if (!feeStatus) {
            return res.status(404).json({ error: 'FeeStatus not found' });
        }

        const updatedTotalFees = parseFloat(feeStatus.totalFees) + parseFloat(amount);
        const updatedRemainingFees = updatedTotalFees - parseFloat(feeStatus.feesSubmitted);

        await feeStatus.update({
            totalFees: updatedTotalFees.toFixed(2),
            remainingFees: updatedRemainingFees.toFixed(2),
        });

        res.status(201).json({ message: 'Other charges added successfully', newCharge, feeStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all other charge records for a student
router.get('/charges/:feeStatusId', async (req, res) => {
    try {
        const { feeStatusId } = req.params;

        const charges = await OtherChargesRecord.findAll({
            where: { feeStatusId },
        });

        if (!charges.length) {
            return res.status(404).json({ error: 'No charge records found' });
        }

        res.status(200).json(charges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
