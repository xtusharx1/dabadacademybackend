const express = require('express');
const router = express.Router();
const FeePaymentRecord = require('../models/FeePaymentRecord');
const FeeStatus = require('../models/FeeStatus');
const sequelize = require('../config/db');

// Get all payment records
router.get('/', async (req, res) => {
  try {
    const payments = await FeePaymentRecord.findAll();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single payment record by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await FeePaymentRecord.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all payment records for a student's fee status
router.get('/fee-status/:feeStatusId', async (req, res) => {
  try {
    const { feeStatusId } = req.params;

    const payments = await FeePaymentRecord.findAll({
      where: { feeStatusId },
      order: [['date', 'DESC']]
    });

    if (!payments.length) {
      return res.status(404).json({ message: 'No payment records found for this fee status' });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payment records:', error);
    res.status(500).json({ error: error.message });
  }
});
// Fetch all payment records for a student's fee status
router.get('/payments/:feeStatusId', async (req, res) => {
  try {
    const { feeStatusId } = req.params;

    const payments = await FeePaymentRecord.findAll({
      where: { feeStatusId },
      order: [['date', 'DESC']]
    });

    if (!payments.length) {
      return res.status(404).json({ message: 'No payment records found for this fee status' });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payment records:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a payment record
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, date, amount, description, isPaid, feeStatusId } = req.body;

    // Create a new payment record
    const newPayment = await FeePaymentRecord.create({ 
      title, 
      date, 
      amount, 
      description,
      isPaid: isPaid !== undefined ? isPaid : true,
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

    const updatedFeesSubmitted = parseFloat(feeStatus.feesSubmitted) + parseFloat(amount);
    const updatedRemainingFees = parseFloat(feeStatus.totalFees) - updatedFeesSubmitted;

    // Check if payment is now complete
    const paymentCompleted = updatedRemainingFees <= 0;

    await feeStatus.update({
      feesSubmitted: updatedFeesSubmitted.toFixed(2),
      remainingFees: updatedRemainingFees.toFixed(2),
      paymentCompleted: paymentCompleted,
      nextDueDate: paymentCompleted ? null : feeStatus.nextDueDate
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ 
      message: 'Payment added successfully', 
      payment: newPayment,
      feeStatus: await FeeStatus.findByPk(feeStatusId)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error adding payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Edit a payment record
router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, date, amount, description, isPaid, feeStatusId } = req.body;
    
    // Find the existing payment record
    const paymentRecord = await FeePaymentRecord.findByPk(id, { transaction: t });
    
    if (!paymentRecord) {
      await t.rollback();
      return res.status(404).json({ error: 'Payment record not found' });
    }
    
    // Get the original amount before updating
    const originalAmount = parseFloat(paymentRecord.amount);
    const newAmount = parseFloat(amount);
    const amountDifference = newAmount - originalAmount;
    
    // Update the payment record
    const updatedPayment = await paymentRecord.update({
      title,
      date,
      amount,
      description,
      isPaid,
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
        const updatedFeesSubmitted = parseFloat(feeStatus.feesSubmitted) + amountDifference;
        const updatedRemainingFees = parseFloat(feeStatus.totalFees) - updatedFeesSubmitted;
        
        // Check if payment is now complete
        const paymentCompleted = updatedRemainingFees <= 0;
        
        await feeStatus.update({
          feesSubmitted: updatedFeesSubmitted.toFixed(2),
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
      message: 'Payment record updated successfully', 
      payment: updatedPayment,
      feeStatus: await FeeStatus.findByPk(feeStatusId)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error updating payment record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a payment record
router.delete('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    // Find the payment record
    const paymentRecord = await FeePaymentRecord.findByPk(id, { transaction: t });
    
    if (!paymentRecord) {
      await t.rollback();
      return res.status(404).json({ error: 'Payment record not found' });
    }
    
    const amount = parseFloat(paymentRecord.amount);
    const feeStatusId = paymentRecord.feeStatusId;
    
    // Delete the payment record
    await paymentRecord.destroy({ transaction: t });
    
    // Update the FeeStatus
    const feeStatus = await FeeStatus.findByPk(feeStatusId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    
    if (feeStatus) {
      // Recalculate fees
      const updatedFeesSubmitted = parseFloat(feeStatus.feesSubmitted) - amount;
      const updatedRemainingFees = parseFloat(feeStatus.totalFees) - updatedFeesSubmitted;
      
      // Check if payment is still complete
      const paymentCompleted = updatedRemainingFees <= 0;
      
      await feeStatus.update({
        feesSubmitted: updatedFeesSubmitted.toFixed(2),
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
      message: 'Payment record deleted successfully',
      feeStatus: await FeeStatus.findByPk(feeStatusId)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting payment record:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;