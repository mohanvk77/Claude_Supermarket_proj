const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

// GET /api/sales
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 20, date, from, to, customer, payment } = req.query;
  const query = {};
  if (date) query.date = date;
  if (from || to) { query.date = {}; if (from) query.date.$gte = from; if (to) query.date.$lte = to; }
  if (customer) query.customerName = new RegExp(customer, 'i');
  if (payment) query.paymentMethod = payment;

  try {
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ success: true, data: sales, total, page: parseInt(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/sales/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/sales
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, customerName, items, discount = 0, paymentMethod } = req.body;
    if (!items || !items.length) return res.status(400).json({ success: false, message: 'Items required' });
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const total = subtotal - parseFloat(discount);
    const sale = await Sale.create({
      customerId: customerId || null,
      customerName: customerName || 'Walk-in Customer',
      items, subtotal,
      discount: parseFloat(discount),
      total,
      paymentMethod: paymentMethod || 'Cash',
      date: new Date().toISOString().split('T')[0],
    });
    res.status(201).json({ success: true, data: sale });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
