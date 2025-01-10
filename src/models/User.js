// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: true,
  },
  apiToken: {
    type: String,
    unique: true,
    sparse: true
  },
  domain: { 
    type: String,
    trim: true,
    sparse: true    
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nip: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^\d{10}$/.test(v),
      message: 'NIP must be 10 digits'
    }
  },
  regon: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^\d{9}$/.test(v),
      message: 'REGON must be 9 digits'
    }
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
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);