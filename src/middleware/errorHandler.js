// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Error details:', err);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
  
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate entry' });
    }
  
    res.status(500).json({ 
      error: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;