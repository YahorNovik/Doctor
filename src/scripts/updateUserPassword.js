const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const User = require('../models/User');

const updateUserPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/doctor-income ');
    console.log('Connected to MongoDB');

    // Password you want to set
    const rawPassword = '91IBIsan,';
    const passwordHash = CryptoJS.SHA256(rawPassword).toString(CryptoJS.enc.Hex);

    // Update user
    const result = await User.findOneAndUpdate(
      { email: 'egornovik2010@gmail.com' },
      { passwordHash },
      { new: true }
    );

    if (result) {
      console.log('Password updated successfully for user:', result.email);
    } else {
      console.log('User not found');
    }

  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateUserPassword();