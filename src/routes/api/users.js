// src/routes/api/users.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/User');
const validate = require('../../middleware/validate');
const { userValidators } = require('../../middleware/validators');

router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
    }
  });

router.post('/', userValidators, validate, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', userValidators, validate, async (req, res) => {
    try {
      console.log('Request body:', req.body);
      const updatedFields = { ...req.body };
      console.log('Fields to update:', updatedFields);
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true, runValidators: true }
      );
      
      console.log('User after update:', user);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({ error: error.message });
    }
  });

router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching user with ID:', req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;