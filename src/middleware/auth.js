// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in request');
      throw new Error('No auth token');
    }

    console.log('Token received:', {
      token: token.substring(0, 20) + '...',
      headers: req.headers,
      path: req.path,
      method: req.method,
      time: new Date().toISOString()
    });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded successfully:', {
        userId: decoded.userId,
        exp: new Date(decoded.exp * 1000).toISOString(),
        timeLeft: Math.round((decoded.exp - Date.now()/1000)/60) + ' minutes'
      });
      req.userId = decoded.userId;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', {
      message: error.message,
      time: new Date().toISOString()
    });
    res.status(401).json({ error: 'Authentication required' });
  }
};

module.exports = auth;