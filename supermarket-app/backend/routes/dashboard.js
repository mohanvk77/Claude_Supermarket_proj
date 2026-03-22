const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/dashboard/summary
router.get('/summary', auth, (req, res) => {
  const sales = db.get('sales').value();
  const products = db.get('products').value();
  const customers = db.get('customers').value();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const todaySales = sales.filter(s => s.date === today);
  const yesterdaySales = sales.filter(s => s.date === yesterday);

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.total, 0);

  // Monthly revenue
  const thisMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  const monthSales = sales.filter(s => s.date.startsWith(thisMonth));
  const lastMonthSales = sales.filter(s => s.date.startsWith(lastMonth));

  const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + s.total, 0);

  const lowStock = products.filter(p => p.stock < 20).length;

  res.json({
    success: true,
    data: {
      todayRevenue,
      todayTransactions: todaySales.length,
      yesterdayRevenue,
      monthRevenue,
      lastMonthRevenue,
      monthTransactions: monthSales.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      lowStockCount: lowStock,
      totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
    }
  });
});

// GET /api/dashboard/sales-chart
router.get('/sales-chart', auth, (req, res) => {
  const { days = 30 } = req.query;
  const sales = db.get('sales').value();

  const result = [];
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySales = sales.filter(s => s.date === dateStr);
    result.push({
      date: dateStr,
      label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
      transactions: daySales.length
    });
  }

  res.json({ success: true, data: result });
});

// GET /api/dashboard/category-sales
router.get('/category-sales', auth, (req, res) => {
  const sales = db.get('sales').value();
  const categoryMap = {};

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!categoryMap[item.category]) categoryMap[item.category] = 0;
      categoryMap[item.category] += item.amount;
    });
  });

  const data = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  res.json({ success: true, data });
});

// GET /api/dashboard/top-products
router.get('/top-products', auth, (req, res) => {
  const sales = db.get('sales').value();
  const productMap = {};

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productMap[item.productName]) {
        productMap[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productMap[item.productName].qty += item.qty;
      productMap[item.productName].revenue += item.amount;
    });
  });

  const data = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  res.json({ success: true, data });
});

// GET /api/dashboard/payment-methods
router.get('/payment-methods', auth, (req, res) => {
  const sales = db.get('sales').value();
  const payMap = {};

  sales.forEach(s => {
    if (!payMap[s.paymentMethod]) payMap[s.paymentMethod] = { name: s.paymentMethod, count: 0, amount: 0 };
    payMap[s.paymentMethod].count++;
    payMap[s.paymentMethod].amount += s.total;
  });

  res.json({ success: true, data: Object.values(payMap) });
});

module.exports = router;
