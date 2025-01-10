const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  fakturownia_id: String,
  number: String,
  sellDate: Date,
  price: Number,
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

module.exports = mongoose.model('Invoice', invoiceSchema);