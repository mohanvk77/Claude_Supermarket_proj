import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdStorefront, MdLock, MdPerson } from 'react-icons/md';

const Login = () => {
  const [form, setForm] = useState({ username: 'demo', password: 'demo' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.username, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}><MdStorefront size={32} color="white" /></div>
          <h1 style={styles.title}>SuperMart</h1>
          <p style={styles.sub}>Retail Reporting System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div style={styles.inputWrap}>
              <MdPerson style={styles.inputIcon} />
              <input
                className="form-control"
                style={styles.input}
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={styles.inputWrap}>
              <MdLock style={styles.inputIcon} />
              <input
                className="form-control"
                style={styles.input}
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.hint}>Demo: username <strong>demo</strong> / password <strong>demo</strong></p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    background: 'white', borderRadius: 16, padding: '40px',
    width: '100%', maxWidth: 400,
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
  },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 16,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
  },
  title: { fontSize: 24, fontWeight: 700, color: '#1e293b', fontFamily: 'Poppins, sans-serif' },
  sub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 },
  input: { paddingLeft: 38 },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
  btn: { width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 4 },
  hint: { textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' },
};

export default Login;
