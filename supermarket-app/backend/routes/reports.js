const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/reports/sales-summary?from=&to=
router.get('/sales-summary', auth, (req, res) => {
  const { from, to } = req.query;
  let sales = db.get('sales').value();
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
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
  const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

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
      daily,
      paymentBreakdown: Object.values(payMap)
    }
  });
});

// GET /api/reports/product-performance
router.get('/product-performance', auth, (req, res) => {
  const { from, to } = req.query;
  let sales = db.get('sales').value();
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);

  const productMap = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          productId: item.productId,
          name: item.productName,
          category: item.category,
          qtySold: 0,
          revenue: 0,
          orders: 0
        };
      }
      productMap[item.productId].qtySold += item.qty;
      productMap[item.productId].revenue += item.amount;
      productMap[item.productId].orders++;
    });
  });

  const data = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
  res.json({ success: true, data });
});

// GET /api/reports/category-performance
router.get('/category-performance', auth, (req, res) => {
  const { from, to } = req.query;
  let sales = db.get('sales').value();
  if (from) sales = sales.filter(s => s.date >= from);
  if (to) sales = sales.filter(s => s.date <= to);

  const catMap = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!catMap[item.category]) catMap[item.category] = { category: item.category, revenue: 0, qty: 0 };
      catMap[item.category].revenue += item.amount;
      catMap[item.category].qty += item.qty;
    });
  });

  res.json({ success: true, data: Object.values(catMap).sort((a, b) => b.revenue - a.revenue) });
});

module.exports = router;
