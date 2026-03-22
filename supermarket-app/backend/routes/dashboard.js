const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// GET /api/dashboard/summary
router.get('/summary', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const [todaySales, yesterdaySales, monthSales, lastMonthSales, totalProducts, totalCustomers, lowStock] = await Promise.all([
      Sale.find({ date: today }),
      Sale.find({ date: yesterday }),
      Sale.find({ date: new RegExp(`^${thisMonth}`) }),
      Sale.find({ date: new RegExp(`^${lastMonth}`) }),
      Product.countDocuments(),
      Customer.countDocuments(),
      Product.countDocuments({ stock: { $lt: 20 } }),
    ]);

    res.json({
      success: true,
      data: {
        todayRevenue: todaySales.reduce((s, x) => s + x.total, 0),
        todayTransactions: todaySales.length,
        yesterdayRevenue: yesterdaySales.reduce((s, x) => s + x.total, 0),
        monthRevenue: monthSales.reduce((s, x) => s + x.total, 0),
        lastMonthRevenue: lastMonthSales.reduce((s, x) => s + x.total, 0),
        monthTransactions: monthSales.length,
        totalProducts, totalCustomers, lowStockCount: lowStock,
        totalRevenue: (await Sale.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]))[0]?.total || 0,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/sales-chart
router.get('/sales-chart', auth, async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const sales = await Sale.find({ date: dateStr });
      result.push({
        date: dateStr,
        label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: sales.reduce((s, x) => s + x.total, 0),
        transactions: sales.length
      });
    }
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/category-sales
router.get('/category-sales', auth, async (req, res) => {
  try {
    const result = await Sale.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.category', value: { $sum: '$items.amount' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } }
    ]);
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/top-products
router.get('/top-products', auth, async (req, res) => {
  try {
    const result = await Sale.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', revenue: { $sum: '$items.amount' }, qty: { $sum: '$items.qty' } } },
      { $project: { name: '$_id', revenue: 1, qty: 1, _id: 0 } },
      { $sort: { revenue: -1 } },
      { $limit: 8 }
    ]);
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/dashboard/payment-methods
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const result = await Sale.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$total' } } },
      { $project: { name: '$_id', count: 1, amount: 1, _id: 0 } }
    ]);
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
