const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/customers
router.get('/', auth, (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  let customers = db.get('customers').value();

  if (search) {
    const s = search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(s) || c.phone.includes(s) || (c.email && c.email.toLowerCase().includes(s))
    );
  }

  // Enrich with purchase totals
  const sales = db.get('sales').value();
  customers = customers.map(c => {
    const customerSales = sales.filter(s => s.customerId === c.id);
    return {
      ...c,
      totalPurchases: customerSales.reduce((sum, s) => sum + s.total, 0),
      totalOrders: customerSales.length,
      lastPurchase: customerSales.length ? customerSales[customerSales.length - 1].date : null
    };
  });

  const total = customers.length;
  const start = (page - 1) * parseInt(limit);
  const paginated = customers.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paginated, total });
});

// GET /api/customers/:id
router.get('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const customer = db.get('customers').find({ id }).value();
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

  const sales = db.get('sales').filter(s => s.customerId === id).value();
  res.json({ success: true, data: { ...customer, sales, totalPurchases: sales.reduce((sum, s) => sum + s.total, 0) } });
});

// POST /api/customers
router.post('/', auth, (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and phone required' });

  const nextIds = db.get('nextIds').value();
  const newCustomer = {
    id: nextIds.customer,
    name, phone,
    email: email || '',
    address: address || '',
    totalPurchases: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.get('customers').push(newCustomer).write();
  db.set('nextIds.customer', nextIds.customer + 1).write();
  res.status(201).json({ success: true, data: newCustomer });
});

// PUT /api/customers/:id
router.put('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const customer = db.get('customers').find({ id }).value();
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

  const { name, phone, email, address } = req.body;
  db.get('customers').find({ id }).assign({ name, phone, email, address }).write();
  res.json({ success: true, data: db.get('customers').find({ id }).value() });
});

// DELETE /api/customers/:id
router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('customers').remove({ id }).write();
  res.json({ success: true, message: 'Customer deleted' });
});

module.exports = router;
