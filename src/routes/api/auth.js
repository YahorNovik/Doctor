const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
      console.log('Received login data:', {
        email: req.body.email,
        passwordHashPresent: !!req.body.passwordHash
      });
  
      const user = await User.findOne({ email: req.body.email });
      console.log('Found user:', !!user);
      
      if (user) {
        console.log(user)
        console.log('Password comparison:', {
          stored: user.passwordHash, 
          received: req.body.passwordHash,
          match: user.passwordHash === req.body.passwordHash
        });
      }
  
      if (!user || user.passwordHash !== req.body.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
  
      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: error.message });
    }
  });

router.post('/register', async (req, res) => {
    try {
      // No need for bcrypt
      const user = new User({
        email: req.body.email,
        passwordHash: req.body.passwordHash,  // Already hashed with SHA256 from frontend
        name: req.body.name,
        nip: req.body.nip,
        regon: req.body.regon,
        city: req.body.city,
        street: req.body.street,
        buildingNumber: req.body.buildingNumber
      });
  
      await user.save();
      
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
  
      res.json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;