// src/routes/api/transactions.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../../models/Transaction');
const validate = require('../../middleware/validate');
const { transactionValidators } = require('../../middleware/validators');

// src/routes/api/transactions.js
// src/routes/api/transactions.js
router.get('/', async (req, res) => {
    try {
      const { month, year, employerId } = req.query;
      const query = { userId: req.userId }; // Add userId to query
      
      if (employerId) {
        query.employerId = employerId;
      }
      
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        query.date = { $gte: startDate, $lte: endDate };
      }
      
      const transactions = await Transaction.find(query)
        .populate('employerId', 'name')
        .sort({ date: -1 });
      
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: error.message });
    }
   });

router.get('/:id', async (req, res) => {
 try {
   const transaction = await Transaction.findOne({
     _id: req.params.id
   }).populate('employerId', 'name');
   
   if (!transaction) {
     return res.status(404).json({ message: 'Transaction not found' });
   }
   res.json(transaction);
 } catch (error) {
   console.error('Error fetching single transaction:', error);
   res.status(500).json({ error: error.message });
 }
});

router.post('/', transactionValidators, validate, async (req, res) => {
 try {
   const transaction = new Transaction({
     ...req.body,
     userId: req.userId
   });
   await transaction.save();
   res.status(201).json(transaction);
 } catch (error) {
   console.error('Error creating transaction:', error);
   res.status(400).json({ error: error.message });
 }
});

router.put('/:id', transactionValidators, validate, async (req, res) => {
 try {
   const transaction = await Transaction.findOneAndUpdate(
     { _id: req.params.id },
     req.body,
     { new: true, runValidators: true }
   );
   if (!transaction) {
     return res.status(404).json({ message: 'Transaction not found' });
   }
   res.json(transaction);
 } catch (error) {
   console.error('Error updating transaction:', error);
   res.status(400).json({ error: error.message });
 }
});

router.delete('/:id', async (req, res) => {
 try {
   const transaction = await Transaction.findOneAndDelete({
     _id: req.params.id
   });
   if (!transaction) {
     return res.status(404).json({ message: 'Transaction not found' });
   }
   res.json({ message: 'Transaction deleted' });
 } catch (error) {
   console.error('Error deleting transaction:', error);
   res.status(500).json({ error: error.message });
 }
});

module.exports = router;