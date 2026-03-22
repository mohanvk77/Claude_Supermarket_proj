import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { MdSearch, MdVisibility } from 'react-icons/md';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Credit'];

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ from: '', to: '', customer: '', payment: '' });
  const [selected, setSelected] = useState(null);
  const limit = 15;

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const res = await API.get(`/sales?${params}`);
      setSales(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const totalPages = Math.ceil(total / limit);

  const payBadge = (m) => {
    const map = { Cash: 'badge-success', UPI: 'badge-info', Card: 'badge-primary', Credit: 'badge-warning' };
    return map[m] || 'badge-primary';
  };

  return (
    <div>
      <Navbar title="Sales" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Sales Transactions</h1>
            <p>{total} total records</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="filter-row">
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Customer</label>
              <div className="search-bar" style={{ marginTop: 4 }}>
                <MdSearch className="search-icon" size={18} />
                <input className="form-control" placeholder="Search customer..." value={filters.customer}
                  onChange={e => { setFilters({ ...filters, customer: e.target.value }); setPage(1); }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>From Date</label>
              <input className="form-control" type="date" style={{ marginTop: 4 }} value={filters.from}
                onChange={e => { setFilters({ ...filters, from: e.target.value }); setPage(1); }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>To Date</label>
              <input className="form-control" type="date" style={{ marginTop: 4 }} value={filters.to}
                onChange={e => { setFilters({ ...filters, to: e.target.value }); setPage(1); }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Payment</label>
              <select className="form-control" style={{ marginTop: 4 }} value={filters.payment}
                onChange={e => { setFilters({ ...filters, payment: e.target.value }); setPage(1); }}>
                <option value="">All</option>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 20 }}
              onClick={() => { setFilters({ from: '', to: '', customer: '', payment: '' }); setPage(1); }}>
              Clear
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No sales found</td></tr>
                ) : sales.map(s => (
                  <tr key={s.id}>
                    <td><span style={{ fontWeight: 600, color: '#6366f1' }}>{s.invoiceNo}</span></td>
                    <td>{s.customerName}</td>
                    <td>{formatDate(s.date)}</td>
                    <td><span className="badge badge-info">{s.items.length} items</span></td>
                    <td><span className={`badge ${payBadge(s.paymentMethod)}`}>{s.paymentMethod}</span></td>
                    <td style={{ color: '#ef4444' }}>{s.discount > 0 ? `-${formatCurrency(s.discount)}` : '-'}</td>
                    <td><strong>{formatCurrency(s.total)}</strong></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                        <MdVisibility size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
              <div style={styles.pages}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} className="btn btn-sm" onClick={() => setPage(p)}
                      style={{ background: p === page ? '#6366f1' : 'transparent', color: p === page ? 'white' : '#64748b', border: '1px solid #e2e8f0' }}>
                      {p}
                    </button>
                  );
                })}
                <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>{selected.invoiceNo}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, fontSize: 13 }}>
              <div><span style={{ color: '#64748b' }}>Customer:</span> <strong>{selected.customerName}</strong></div>
              <div><span style={{ color: '#64748b' }}>Date:</span> <strong>{formatDate(selected.date)}</strong></div>
              <div><span style={{ color: '#64748b' }}>Payment:</span> <span className={`badge ${payBadge(selected.paymentMethod)}`}>{selected.paymentMethod}</span></div>
              <div><span style={{ color: '#64748b' }}>Discount:</span> <strong style={{ color: '#ef4444' }}>{formatCurrency(selected.discount)}</strong></div>
            </div>
            <table style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.productName}</td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td><strong>{formatCurrency(item.amount)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Subtotal: {formatCurrency(selected.subtotal)}</span><br />
              <span style={{ fontSize: 13, color: '#ef4444' }}>Discount: -{formatCurrency(selected.discount)}</span><br />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>Total: {formatCurrency(selected.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 8, borderTop: '1px solid #e2e8f0' },
  pages: { display: 'flex', gap: 4 },
};

export default Sales;
