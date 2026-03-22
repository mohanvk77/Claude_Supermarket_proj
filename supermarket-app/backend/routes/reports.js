const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

// GET /api/reports/sales-summary
router.get('/sales-summary', auth, async (req, res) => {
  const { from, to } = req.query;
  const query = {};
  if (from || to) { query.date = {}; if (from) query.date.$gte = from; if (to) query.date.$lte = to; }

  try {
    const sales = await Sale.find(query);
    const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
    const totalDiscount = sales.reduce((s, x) => s + x.discount, 0);
    const totalTransactions = sales.length;
    const avgOrderValue = totalTransactions ? totalRevenue / totalTransactions : 0;

    // Daily breakdown
    const dailyMap = {};
    sales.forEach(s => {
      if (!dailyMap[s.date]) dailyMap[s.date] = { date: s.date, revenue: 0, transactions: 0, discount: 0 };
      dailyMap[s.date].revenue += s.total;
      dailyMap[s.date].transactions++;
      dailyMap[s.date].discount += s.discount;
    });

    // Payment breakdown
    const payMap = {};
    sales.forEach(s => {
      if (!payMap[s.paymentMethod]) payMap[s.paymentMethod] = { method: s.paymentMethod, count: 0, amount: 0 };
      payMap[s.paymentMethod].count++;
      payMap[s.paymentMethod].amount += s.total;
    });

    res.json({
      success: true,
      data: {
        totalRevenue, totalDiscount, totalTransactions, avgOrderValue,
        daily: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
        paymentBreakdown: Object.values(payMap)
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/reports/product-performance
router.get('/product-performance', auth, async (req, res) => {
  const { from, to } = req.query;
  const query = {};
  if (from || to) { query.date = {}; if (from) query.date.$gte = from; if (to) query.date.$lte = to; }

  try {
    const result = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.productName',
        category: { $first: '$items.category' },
        qtySold: { $sum: '$items.qty' },
        revenue: { $sum: '$items.amount' },
        orders: { $sum: 1 }
      }},
      { $project: { name: '$_id', category: 1, qtySold: 1, revenue: 1, orders: 1, _id: 0 } },
      { $sort: { revenue: -1 } }
    ]);
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/reports/category-performance
router.get('/category-performance', auth, async (req, res) => {
  const { from, to } = req.query;
  const query = {};
  if (from || to) { query.date = {}; if (from) query.date.$gte = from; if (to) query.date.$lte = to; }

  try {
    const result = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: '$items.amount' }, qty: { $sum: '$items.qty' } } },
      { $project: { category: '$_id', revenue: 1, qty: 1, _id: 0 } },
      { $sort: { revenue: -1 } }
    ]);
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
