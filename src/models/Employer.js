// src/models/Employer.js
const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nip: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^\d{10}$/.test(v),
      message: 'NIP must be 10 digits'
    }
  },
  regon: {
    type: String,
    //required: true,
  },
  fakturownia_id: {
    type: String,
    sparse: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  buildingNumber: {
    type: String,
    //required: true,
    trim: true
  },
  defaultPercent: {
    type: Number,
    required: true,
    min: [0, 'Percent cannot be negative'],
    max: [100, 'Percent cannot exceed 100']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);