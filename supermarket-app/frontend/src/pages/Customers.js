import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdPerson } from 'react-icons/md';

const emptyForm = { name: '', phone: '', email: '', address: '' };

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const limit = 15;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      const res = await API.get(`/customers?${params}`);
      setCustomers(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await API.put(`/customers/${editing.id}`, form);
      else await API.post('/customers', form);
      setShowModal(false);
      fetchCustomers();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    await API.delete(`/customers/${id}`);
    fetchCustomers();
  };

  return (
    <div>
      <Navbar title="Customers" />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Customers</h1><p>{total} customers registered</p></div>
          <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Customer</button>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="search-bar">
            <MdSearch className="search-icon" size={18} />
            <input className="form-control" placeholder="Search by name, phone or email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th><th>Phone</th><th>Email</th>
                  <th>Location</th><th>Orders</th><th>Total Spent</th><th>Last Purchase</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No customers found</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MdPerson color="#6366f1" size={18} />
                        </div>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.address || '-'}</td>
                    <td><span className="badge badge-info">{c.totalOrders || 0}</span></td>
                    <td><strong>{formatCurrency(c.totalPurchases)}</strong></td>
                    <td>{c.lastPurchase ? formatDate(c.lastPurchase) : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}><MdEdit size={14} /></button>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => handleDelete(c.id)}><MdDelete size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City / Area" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
