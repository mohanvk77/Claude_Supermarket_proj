const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

// GET /api/customers
router.get('/', auth, async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$or = [
    { name: new RegExp(search, 'i') },
    { phone: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') }
  ];

  try {
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });

    // Enrich with purchase totals
    const enriched = await Promise.all(customers.map(async (c) => {
      const sales = await Sale.find({ customerId: c._id });
      return {
        ...c.toObject(),
        totalPurchases: sales.reduce((sum, s) => sum + s.total, 0),
        totalOrders: sales.length,
        lastPurchase: sales.length ? sales[sales.length - 1].date : null
      };
    }));

    res.json({ success: true, data: enriched, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/customers/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const sales = await Sale.find({ customerId: req.params.id });
    res.json({ success: true, data: { ...customer.toObject(), sales, totalPurchases: sales.reduce((s, x) => s + x.total, 0) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/customers
router.post('/', auth, async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/customers/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/customers/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
