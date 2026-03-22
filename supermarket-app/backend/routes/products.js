const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/products
router.get('/', auth, (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;
  let products = db.get('products').value();

  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(s) || p.barcode.includes(s));
  }
  if (category) products = products.filter(p => p.category === category);

  const total = products.length;
  const start = (page - 1) * limit;
  const paginated = products.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paginated, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/products/categories
router.get('/categories', auth, (req, res) => {
  const products = db.get('products').value();
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ success: true, data: categories });
});

// GET /api/products/:id
router.get('/:id', auth, (req, res) => {
  const product = db.get('products').find({ id: parseInt(req.params.id) }).value();
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// POST /api/products
router.post('/', auth, (req, res) => {
  const { name, category, price, stock, unit, barcode } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
  }

  const nextIds = db.get('nextIds').value();
  const newProduct = {
    id: nextIds.product,
    name, category,
    price: parseFloat(price),
    stock: parseInt(stock) || 0,
    unit: unit || 'unit',
    barcode: barcode || `P${String(nextIds.product).padStart(3, '0')}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.get('products').push(newProduct).write();
  db.set('nextIds.product', nextIds.product + 1).write();

  res.status(201).json({ success: true, data: newProduct });
});

// PUT /api/products/:id
router.put('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.get('products').find({ id }).value();
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, category, price, stock, unit, barcode } = req.body;
  db.get('products').find({ id }).assign({
    name: name || product.name,
    category: category || product.category,
    price: price !== undefined ? parseFloat(price) : product.price,
    stock: stock !== undefined ? parseInt(stock) : product.stock,
    unit: unit || product.unit,
    barcode: barcode || product.barcode,
  }).write();

  res.json({ success: true, data: db.get('products').find({ id }).value() });
});

// DELETE /api/products/:id
router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('products').remove({ id }).write();
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
