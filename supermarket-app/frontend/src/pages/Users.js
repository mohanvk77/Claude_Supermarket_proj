import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';
import { MdAdd, MdEdit, MdDelete, MdPerson } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = ['admin', 'manager', 'cashier'];
const emptyForm = { username: '', password: '', name: '', role: 'cashier' };

const roleColor = { admin: 'badge-primary', manager: 'badge-success', cashier: 'badge-warning' };

const Users = () => {
  const { can, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!can('manage_users')) { navigate('/dashboard'); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users');
      setUsers(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ username: u.username, password: '', name: u.name, role: u.role });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.username || (!editing && !form.password) || !form.role) {
      setError('All fields are required'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) await API.put(`/users/${editing._id}`, payload);
      else await API.post('/users', payload);
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save user');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div>
      <Navbar title="User Management" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>User Management</h1>
            <p>Manage admin, manager and cashier accounts</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add User</button>
        </div>

        {/* Role Legend */}
        <div style={styles.legendRow}>
          {[
            { role: 'Admin',   color: '#6366f1', desc: 'Full access to all features' },
            { role: 'Manager', color: '#22c55e', desc: 'Dashboard, Sales, Customers, Reports' },
            { role: 'Cashier', color: '#f59e0b', desc: 'Create sales only' },
          ].map((r, i) => (
            <div key={i} style={styles.legendCard}>
              <div style={{ ...styles.legendDot, background: r.color }} />
              <div>
                <div style={styles.legendRole}>{r.role}</div>
                <div style={styles.legendDesc}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>User</th><th>Username</th><th>Role</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ ...styles.avatar, background: u.role === 'admin' ? '#6366f1' : u.role === 'manager' ? '#22c55e' : '#f59e0b' }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          {u._id === currentUser?.id && <div style={{ fontSize: 11, color: '#94a3b8' }}>You</div>}
                        </div>
                      </div>
                    </td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{u.username}</code></td>
                    <td><span className={`badge ${roleColor[u.role]}`}>{u.role}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}><MdEdit size={14} /></button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
                          onClick={() => handleDelete(u._id)}
                          disabled={u._id === currentUser?.id}
                        ><MdDelete size={14} /></button>
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
              <h2>{editing ? 'Edit User' : 'Add New User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Smith" />
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. john_smith" disabled={!!editing} />
            </div>
            <div className="form-group">
              <label>{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'Min 6 characters'} />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
              <div style={styles.roleHint}>
                {form.role === 'admin'   && '⚡ Full access to everything including user management'}
                {form.role === 'manager' && '📊 Access to dashboard, sales, customers and reports'}
                {form.role === 'cashier' && '🧾 Can only create new sales transactions'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  legendRow: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  legendCard: { display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '14px 20px', borderRadius: 12, border: '1px solid #e2e8f0', flex: 1, minWidth: 200 },
  legendDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  legendRole: { fontWeight: 700, fontSize: 14, color: '#1e293b' },
  legendDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  avatar: { width: 36, height: 36, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  roleHint: { fontSize: 12, color: '#6366f1', marginTop: 6, fontStyle: 'italic' },
};

export default Users;
