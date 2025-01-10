// src/routes/api/employers.js
const express = require('express');
const mongoose = require('mongoose'); 
const router = express.Router();
const Employer = require('../../models/Employer');
const validate = require('../../middleware/validate');
const { employerValidators } = require('../../middleware/validators');

router.get('/', async (req, res) => {
    try {
      console.log('Fetching employers for user:', req.userId);
      console.log('Request headers:', req.headers);
      
      const employers = await Employer.find({ userId: req.userId });
      console.log('Found employers:', employers);
      
      res.json(employers);
    } catch (error) {
      console.error('Error in employers route:', {
        error: error.message,
        stack: error.stack,
        userId: req.userId,
        time: new Date().toISOString()
      });
      res.status(500).json({ 
        error: 'Failed to fetch employers',
        details: error.message 
      });
    }
  });

// routes/api/employers.js
router.get('/nip/:nip', async (req, res) => {
    try {
      const employer = await Employer.findOne({ 
        nip: req.params.nip,
        userId: req.userId 
      });
      if (!employer) {
        return res.status(404).json({ message: 'Employer not found' });
      }
      res.json(employer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get('/:id', async (req, res) => {
 try {
   const employer = await Employer.findOne({
     _id: req.params.id,
     userId: req.userId
   });
   if (!employer) return res.status(404).json({ message: 'Employer not found' });
   res.json(employer);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

router.post('/', employerValidators, validate, async (req, res) => {
    try {
      console.log('Creating employer:', {
        body: req.body,
        userId: req.userId
      });
      const employer = new Employer({
        ...req.body,
        userId: req.userId  
      });
      console.log('Employer before save:', employer);
      await employer.save();
      res.status(201).json(employer);
    } catch (error) {
      console.error('Employer creation error:', {
        message: error.message,
        details: error.errors,
        validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : null
      });
      res.status(400).json({ error: error.message });
    }
  });

// routes/api/employers.js
router.put('/:id', employerValidators, validate, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
  
    console.log(`Update request - ID: ${id}, UserID: ${userId}`);
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid employer ID format' });
    }
  
    try {
      const employer = await Employer.findOneAndUpdate(
        { _id: id, userId },
        req.body,
        { new: true, runValidators: true }
      );
  
      console.log('Found employer:', employer);
  
      if (!employer) {
        return res.status(404).json({ message: 'Employer not found for this user' });
      }
  
      res.json(employer);
    } catch (error) {
      console.error('Update error:', error);
      res.status(400).json({ error: error.message });
    }
  });

router.delete('/:id', async (req, res) => {
 try {
   const employer = await Employer.findOneAndDelete({
     _id: req.params.id,
     userId: req.userId
   });
   if (!employer) return res.status(404).json({ message: 'Employer not found' });
   res.json({ message: 'Employer deleted' });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

module.exports = router;