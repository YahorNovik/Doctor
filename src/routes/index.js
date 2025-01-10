// src/routes/index.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Import routes
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const employerRoutes = require('./api/employers');
const transactionRoutes = require('./api/transactions');
const productRoutes = require('./api/products');
const invoiceRoutes = require('./api/invoices');

// Public routes
router.use('/auth', authRoutes);

// Create protected router
const protectedRouter = express.Router();
protectedRouter.use(auth);

// Add protected routes
protectedRouter.use('/users', userRoutes);
protectedRouter.use('/employers', employerRoutes);
protectedRouter.use('/transactions', transactionRoutes);
protectedRouter.use('/products', productRoutes);
protectedRouter.use('/invoices', invoiceRoutes);

// Use protected router
router.use(protectedRouter);

module.exports = router;