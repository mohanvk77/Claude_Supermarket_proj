import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import API from '../utils/api';
import { formatCurrency, formatNumber, getPercentChange, COLORS } from '../utils/helpers';
import {
  MdAttachMoney, MdShoppingCart, MdInventory2, MdPeople, MdWarning
} from 'react-icons/md';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, c, cat, tp, pay] = await Promise.all([
          API.get('/dashboard/summary'),
          API.get('/dashboard/sales-chart?days=30'),
          API.get('/dashboard/category-sales'),
          API.get('/dashboard/top-products'),
          API.get('/dashboard/payment-methods'),
        ]);
        setSummary(s.data.data);
        setSalesChart(c.data.data);
        setCategoryData(cat.data.data);
        setTopProducts(tp.data.data);
        setPaymentData(pay.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div>
      <Navbar title="Dashboard" />
      <div className="page-content loading-center"><div className="spinner" /></div>
    </div>
  );

  const revTrend = summary ? getPercentChange(summary.todayRevenue, summary.yesterdayRevenue) : null;
  const monthTrend = summary ? getPercentChange(summary.monthRevenue, summary.lastMonthRevenue) : null;

  return (
    <div>
      <Navbar title="Dashboard" />
      <div className="page-content">

        {/* Stat Cards */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(summary?.todayRevenue)}
            icon={<MdAttachMoney />}
            color="#6366f1"
            trend={revTrend}
            trendLabel="vs yesterday"
            subtitle={`${summary?.todayTransactions} transactions`}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(summary?.monthRevenue)}
            icon={<MdShoppingCart />}
            color="#22c55e"
            trend={monthTrend}
            trendLabel="vs last month"
            subtitle={`${summary?.monthTransactions} transactions`}
          />
          <StatCard
            title="Total Products"
            value={formatNumber(summary?.totalProducts)}
            icon={<MdInventory2 />}
            color="#f59e0b"
            subtitle={`${summary?.lowStockCount} low stock`}
          />
          <StatCard
            title="Total Customers"
            value={formatNumber(summary?.totalCustomers)}
            icon={<MdPeople />}
            color="#3b82f6"
          />
        </div>

        {/* Sales Chart */}
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <h3 style={styles.chartTitle}>Revenue (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={styles.chartTitle}>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products + Payment Methods */}
        <div className="grid grid-2">
          <div className="card">
            <h3 style={styles.chartTitle}>Top Products by Revenue</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts.slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={styles.chartTitle}>Payment Methods</h3>
            <div style={{ marginTop: 16 }}>
              {paymentData.map((p, i) => {
                const total = paymentData.reduce((s, x) => s + x.amount, 0);
                const pct = ((p.amount / total) * 100).toFixed(1);
                return (
                  <div key={i} style={styles.payRow}>
                    <div style={styles.payLeft}>
                      <div style={{ ...styles.payDot, background: COLORS[i] }} />
                      <span style={styles.payName}>{p.name}</span>
                    </div>
                    <div style={styles.payRight}>
                      <span style={styles.payAmt}>{formatCurrency(p.amount)}</span>
                      <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${pct}%`, background: COLORS[i] }} />
                      </div>
                      <span style={styles.payPct}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  payRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  payLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  payDot: { width: 10, height: 10, borderRadius: '50%' },
  payName: { fontSize: 13, fontWeight: 500 },
  payRight: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' },
  payAmt: { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: 'right' },
  progressBg: { width: 80, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s' },
  payPct: { fontSize: 12, color: '#64748b', minWidth: 36 },
};

export default Dashboard;
