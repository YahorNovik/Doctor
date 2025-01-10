// src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  percent: {
    type: Number,
    required: true,
    min: [0, 'Percent cannot be negative'],
    max: [100, 'Percent cannot exceed 100']
  },
  patientName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);