// src/routes/api/invoices.js
const express = require('express');
const router = express.Router();
const Invoice = require('../../models/Invoice'); 

router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.userId })
      .populate('employerId');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/employer/:employerId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ 
      userId: req.userId,
      employerId: req.params.employerId 
    }).populate('employerId');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      userId: req.userId
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;