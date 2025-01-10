// src/middleware/validators.js
const { check } = require('express-validator');

const userValidators = [
    check('name').notEmpty().trim(),
    check('nip').matches(/^\d{10}$/).withMessage('NIP must be 10 digits'),
    check('regon').matches(/^\d{9}$/).withMessage('REGON must be 9 digits'),
    check('city').notEmpty().trim(),
    check('street').notEmpty().trim(),
    check('buildingNumber').notEmpty().trim(),
    check('domain').optional().trim(),
    check('apiToken').optional().trim()
  ];

const employerValidators = [
  check('name').notEmpty().trim(),
  check('nip').matches(/^\d{10}$/).withMessage('NIP must be 10 digits'),
  //check('regon').matches(/^\d{9}$/).withMessage('REGON must be 9 digits'),
  check('city').notEmpty().trim(),
  check('street').notEmpty().trim(),
  //check('buildingNumber').trim(),
  check('defaultPercent').isFloat({ min: 0, max: 100 })
];

const transactionValidators = [
  check('date').isISO8601(),
  check('amount').isFloat({ min: 0 }),
  check('percent').isFloat({ min: 0, max: 100 }),
  check('employerId').isMongoId(),
  check('patientName').optional().trim(),
  check('description').optional().trim()
];

module.exports = {
  userValidators,
  employerValidators,
  transactionValidators
};