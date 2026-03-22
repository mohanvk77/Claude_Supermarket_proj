import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { formatCurrency, formatDate, COLORS } from '../utils/helpers';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const getDefaultDates = () => {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0];
  return { from, to };
};

const Reports = () => {
  const [dates, setDates] = useState(getDefaultDates());
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('overview');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = `from=${dates.from}&to=${dates.to}`;
      const [s, p, c] = await Promise.all([
        API.get(`/reports/sales-summary?${params}`),
        API.get(`/reports/product-performance?${params}`),
        API.get(`/reports/category-performance?${params}`),
      ]);
      setSummary(s.data.data);
      setProducts(p.data.data);
      setCategories(c.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const tabs = ['overview', 'products', 'categories'];

  return (
    <div>
      <Navbar title="Reports" />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Reports & Analytics</h1><p>Detailed performance insights</p></div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>From</label>
              <input className="form-control" type="date" value={dates.from} onChange={e => setDates({ ...dates, from: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>To</label>
              <input className="form-control" type="date" value={dates.to} onChange={e => setDates({ ...dates, to: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={fetchReports} disabled={loading}>
              {loading ? 'Loading...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), color: '#6366f1' },
              { label: 'Total Transactions', value: summary.totalTransactions, color: '#22c55e' },
              { label: 'Avg Order Value', value: formatCurrency(summary.avgOrderValue), color: '#f59e0b' },
              { label: 'Total Discount', value: formatCurrency(summary.totalDiscount), color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ borderLeft: `4px solid ${s.color}` }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 6, fontFamily: 'Poppins, sans-serif' }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabRow}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && summary && (
          <div className="grid grid-2">
            <div className="card">
              <h3 style={styles.chartTitle}>Daily Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={summary.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} interval={Math.floor(summary.daily.length / 6)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={styles.chartTitle}>Payment Method Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={summary.paymentBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={100} paddingAngle={3}>
                    {summary.paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="card">
            <h3 style={{ ...styles.chartTitle, marginBottom: 16 }}>Product Performance</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={products.slice(0, 10)} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="table-wrapper" style={{ marginTop: 20 }}>
              <table>
                <thead>
                  <tr><th>#</th><th>Product</th><th>Category</th><th>Qty Sold</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i}>
                      <td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge badge-primary">{p.category}</span></td>
                      <td>{p.qtySold}</td>
                      <td><strong>{formatCurrency(p.revenue)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div className="grid grid-2">
            <div className="card">
              <h3 style={styles.chartTitle}>Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={110} paddingAngle={3} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={styles.chartTitle}>Category Performance Table</h3>
              <table>
                <thead><tr><th>Category</th><th>Revenue</th><th>Qty Sold</th></tr></thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          {c.category}
                        </div>
                      </td>
                      <td><strong>{formatCurrency(c.revenue)}</strong></td>
                      <td>{c.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 8 },
  tabRow: { display: 'flex', gap: 4, marginBottom: 20, background: 'white', padding: 6, borderRadius: 10, border: '1px solid #e2e8f0', width: 'fit-content' },
  tab: { padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#64748b' },
  tabActive: { background: '#6366f1', color: 'white' },
};

export default Reports;
