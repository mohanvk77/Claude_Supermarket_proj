const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET /api/products
router.get('/', auth, async (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { barcode: new RegExp(search, 'i') }];
  if (category) query.category = category;

  try {
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ success: true, data: products, total, page: parseInt(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/products/categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/products/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/products
router.post('/', auth, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
