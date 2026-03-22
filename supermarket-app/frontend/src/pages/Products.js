import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import { MdSearch, MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const UNITS = ['kg', 'g', 'litre', 'ml', 'bottle', 'pack', 'bag', 'box', 'tube', 'jar', 'piece', 'unit'];

const emptyForm = { name: '', category: '', price: '', stock: '', unit: 'kg', barcode: '' };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const limit = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (catFilter) params.set('category', catFilter);
      const res = await API.get(`/products?${params}`);
      setProducts(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, catFilter]);

  useEffect(() => {
    API.get('/products/categories').then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, unit: p.unit, barcode: p.barcode }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await API.put(`/products/${editing.id}`, form);
      else await API.post('/products', form);
      setShowModal(false);
      fetchProducts();
      API.get('/products/categories').then(r => setCategories(r.data.data));
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const stockBadge = (stock) => {
    if (stock === 0) return 'badge-danger';
    if (stock < 20) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div>
      <Navbar title="Products" />
      <div className="page-content">
        <div className="page-header">
          <div><h1>Products</h1><p>{total} products</p></div>
          <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Product</button>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="filter-row">
            <div className="search-bar" style={{ flex: 1 }}>
              <MdSearch className="search-icon" size={18} />
              <input className="form-control" placeholder="Search by name or barcode..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-control" style={{ width: 180 }} value={catFilter}
              onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Barcode</th><th>Product Name</th><th>Category</th>
                  <th>Price</th><th>Stock</th><th>Unit</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{p.barcode}</code></td>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge badge-primary">{p.category}</span></td>
                    <td><strong>{formatCurrency(p.price)}</strong></td>
                    <td><span className={`badge ${stockBadge(p.stock)}`}>{p.stock}</span></td>
                    <td>{p.unit}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><MdEdit size={14} /></button>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => handleDelete(p.id)}><MdDelete size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {Math.ceil(total / limit) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 16, marginTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span style={{ fontSize: 13, padding: '5px 10px', color: '#64748b' }}>Page {page} of {Math.ceil(total / limit)}</span>
              <button className="btn btn-outline btn-sm" disabled={page === Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Product Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Basmati Rice 5kg" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Category *</label>
                <input className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Grains" list="cat-list" />
                <datalist id="cat-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select className="form-control" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input className="form-control" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>Barcode</label>
              <input className="form-control" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="e.g. P001 (auto-generated if empty)" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
