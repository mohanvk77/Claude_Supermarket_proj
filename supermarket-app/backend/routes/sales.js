const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/sales
router.get('/', auth, (req, res) => {
  const { page = 1, limit = 20, date, from, to, customer, payment } = req.query;
  let sales = db.get('sales').value().slice().reverse();

  if (date) sales = sales.filter(s => s.date === date);
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);
  if (customer) sales = sales.filter(s => s.customerName.toLowerCase().includes(customer.toLowerCase()));
  if (payment) sales = sales.filter(s => s.paymentMethod === payment);

  const total = sales.length;
  const start = (page - 1) * parseInt(limit);
  const paginated = sales.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paginated, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/sales/:id
router.get('/:id', auth, (req, res) => {
  const sale = db.get('sales').find({ id: parseInt(req.params.id) }).value();
  if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
  res.json({ success: true, data: sale });
});

// POST /api/sales
router.post('/', auth, (req, res) => {
  const { customerId, customerName, items, discount = 0, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ success: false, message: 'Items required' });

  const sales = db.get('sales').value();
  const nextId = sales.length ? Math.max(...sales.map(s => s.id)) + 1 : 1;
  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const total = subtotal - parseFloat(discount);

  const newSale = {
    id: nextId,
    invoiceNo: `INV-${String(nextId).padStart(5, '0')}`,
    customerId: customerId || null,
    customerName: customerName || 'Walk-in Customer',
    items,
    subtotal,
    discount: parseFloat(discount),
    total,
    paymentMethod: paymentMethod || 'Cash',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  db.get('sales').push(newSale).write();
  res.status(201).json({ success: true, data: newSale });
});

module.exports = router;
