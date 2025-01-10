// index.js (backend)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');
const limiter = require('./src/middleware/rateLimit');
const validateEnv = require('./src/config/env');

validateEnv();

const app = express();

app.use(limiter);
app.use(logger);
app.use(cors());
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Your Vite frontend URL
    credentials: true
  }));

// MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/doctor-income')
 .then(() => {
   console.log('Connected to MongoDB');
 })
 .catch(err => {
   console.error('MongoDB connection error:', err);
   process.exit(1);
 });

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
 res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
 console.error('Uncaught Exception:', err);
 process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
 console.error('Unhandled Rejection:', err);
 process.exit(1);
});