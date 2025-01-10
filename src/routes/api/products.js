const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      userId: req.userId
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {  
    console.log('Delete request received:', {
      id: req.params.id,
      userId: req.userId,
      path: req.path,
      method: req.method
    });

    try {
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });
      console.log('Delete result:', product);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;