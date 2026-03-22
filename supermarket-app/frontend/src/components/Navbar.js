import React from 'react';
import { MdNotifications, MdSearch } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header style={styles.navbar}>
      <div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.date}>{now}</p>
      </div>
      <div style={styles.right}>
        <div style={styles.iconBtn}><MdNotifications size={20} color="#64748b" /></div>
        <div style={styles.userChip}>
          <div style={styles.avatar}>{user?.name?.[0]}</div>
          <span style={styles.username}>{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1e293b', fontFamily: 'Poppins, sans-serif' },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8,
    border: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  userChip: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#6366f1', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13,
  },
  username: { fontSize: 13, fontWeight: 600, color: '#1e293b' },
};

export default Navbar;
