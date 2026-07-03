const express = require('express');
const router = express.Router();
const OtherChargesRecord = require('../models/OtherChargesRecord');
const FeeStatus = require('../models/FeeStatus');
const sequelize = require('../config/db');

// Get all other charge records
router.get('/', async (req, res) => {
  try {
    const charges = await OtherChargesRecord.findAll();
    res.json(charges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single charge record by ID
router.get('/:id', async (req, res) => {
  try {
    const charge = await OtherChargesRecord.findByPk(req.params.id);
    if (!charge) return res.status(404).json({ error: 'Charge record not found' });
    res.json(charge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all other charge records for a student's fee status
router.get('/fee-status/:feeStatusId', async (req, res) => {
  try {
    const { feeStatusId } = req.params;

    const charges = await OtherChargesRecord.findAll({
      where: { feeStatusId },
      order: [['date', 'DESC']]
    });

    if (!charges.length) {
      return res.status(404).json({ message: 'No charge records found for this fee status' });
    }

    res.status(200).json(charges);
  } catch (error) {
    console.error('Error fetching charge records:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/charges/:feeStatusId', async (req, res) => {
  try {
    const { feeStatusId } = req.params;

    const charges = await OtherChargesRecord.findAll({
      where: { feeStatusId },
      order: [['date', 'DESC']]
    });

    if (!charges.length) {
      return res.status(404).json({ message: 'No charge records found for this fee status' });
    }

    res.status(200).json(charges);
  } catch (error) {
    console.error('Error fetching charge records:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add other charges
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, date, amount, description, feeStatusId } = req.body;

    // Create a new charge record
    const newCharge = await OtherChargesRecord.create({ 
      title, 
      date, 
      amount, 
      description, 
      feeStatusId 
    }, { transaction: t });

    // Update FeeStatus with row lock SELECT ... FOR UPDATE
    const feeStatus = await FeeStatus.findByPk(feeStatusId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!feeStatus) {
      await t.rollback();
      return res.status(404).json({ error: 'FeeStatus not found' });
    }

    const updatedTotalFees = parseFloat(feeStatus.totalFees) + parseFloat(amount);
    const updatedRemainingFees = updatedTotalFees - parseFloat(feeStatus.feesSubmitted);

    // Update payment completion status
    const paymentCompleted = updatedRemainingFees <= 0;

    await feeStatus.update({
      totalFees: updatedTotalFees.toFixed(2),
      remainingFees: updatedRemainingFees.toFixed(2),
      paymentCompleted: paymentCompleted,
      nextDueDate: paymentCompleted ? null : feeStatus.nextDueDate
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ 
      message: 'Other charges added successfully', 
      charge: newCharge,
      feeStatus: await FeeStatus.findByPk(feeStatusId)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error adding charge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Edit other charges
router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, date, amount, description, feeStatusId } = req.body;
    
    // Find the existing charge record
    const chargeRecord = await OtherChargesRecord.findByPk(id, { transaction: t });
    
    if (!chargeRecord) {
      await t.rollback();
      return res.status(404).json({ error: 'Charge record not found' });
    }
    
    // Get the original amount before updating
    const originalAmount = parseFloat(chargeRecord.amount);
    const newAmount = parseFloat(amount);
    const amountDifference = newAmount - originalAmount;
    
    // Update the charge record
    const updatedCharge = await chargeRecord.update({
      title,
      date,
      amount,
      description,
      feeStatusId
    }, { transaction: t });
    
    // Update the related FeeStatus record if amount changed
    if (amountDifference !== 0) {
      const feeStatus = await FeeStatus.findByPk(feeStatusId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      
      if (feeStatus) {
        // Recalculate fees
        const updatedTotalFees = parseFloat(feeStatus.totalFees) + amountDifference;
        const updatedRemainingFees = updatedTotalFees - parseFloat(feeStatus.feesSubmitted);
        
        // Check if payment is complete
        const paymentCompleted = updatedRemainingFees <= 0;
        
        await feeStatus.update({
          totalFees: updatedTotalFees.toFixed(2),
          remainingFees: updatedRemainingFees.toFixed(2),
          paymentCompleted: paymentCompleted,
          nextDueDate: paymentCompleted ? null : feeStatus.nextDueDate
        }, { transaction: t });
      } else {
        await t.rollback();
        return res.status(404).json({ error: 'FeeStatus not found' });
      }
    }
    
    await t.commit();
    
    res.status(200).json({ 
      message: 'Charge record updated successfully', 
      charge: updatedCharge,
      feeStatus: await FeeStatus.findByPk(feeStatusId)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error updating charge record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete other charges
router.delete('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    // Find the charge record
    const chargeRecord = await OtherChargesRecord.findByPk(id, { transaction: t });
    
    if (!chargeRecord) {
      await t.rollback();
      return res.status(404).json({ error: 'Charge record not found' });
    }
    
    const amount = parseFloat(chargeRecord.amount);
    const feeStatusId = chargeRecord.feeStatusId;
    
    // Delete the charge record
    await chargeRecord.destroy({ transaction: t });
    
    // Update the FeeStatus
    const feeStatus = await FeeStatus.findByPk(feeStatusId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    
    if (feeStatus) {
      // Recalculate fees
      const updatedTotalFees = parseFloat(feeStatus.totalFees) - amount;
      const updatedRemainingFees = updatedTotalFees - parseFloat(feeStatus.feesSubmitted);
      
      // Check if payment is complete
      const paymentCompleted = updatedRemainingFees <= 0;
      
      await feeStatus.update({
        totalFees: updatedTotalFees.toFixed(2),
        remainingFees: updatedRemainingFees.toFixed(2),
        paymentCompleted: paymentCompleted,
        nextDueDate: paymentCompleted ? null : feeStatus.nextDueDate
      }, { transaction: t });
    } else {
      await t.rollback();
      return res.status(404).json({ error: 'FeeStatus not found' });
    }
    
    await t.commit();
    
    res.status(200).json({ 
      message: 'Charge record deleted successfully',
      feeStatus: await FeeStatus.findByPk(feeStatusId)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting charge record:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;