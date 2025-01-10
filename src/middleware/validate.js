// src/middleware/validate.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validate = (req, res, next) => {
  console.log('validate:', req)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;