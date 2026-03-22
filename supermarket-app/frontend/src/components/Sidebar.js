import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdShoppingCart, MdInventory2,
  MdPeople, MdBarChart, MdLogout, MdStorefront
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
  { to: '/sales', icon: <MdShoppingCart size={20} />, label: 'Sales' },
  { to: '/products', icon: <MdInventory2 size={20} />, label: 'Products' },
  { to: '/customers', icon: <MdPeople size={20} />, label: 'Customers' },
  { to: '/reports', icon: <MdBarChart size={20} />, label: 'Reports' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <MdStorefront size={28} color="#a5b4fc" />
        <div>
          <div style={styles.logoTitle}>SuperMart</div>
          <div style={styles.logoSub}>Retail Reports</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={styles.bottom}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.name?.[0] || 'U'}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <MdLogout size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
    background: '#1e1b4b',
    display: 'flex', flexDirection: 'column',
    zIndex: 100,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoTitle: { color: 'white', fontWeight: 700, fontSize: 16, fontFamily: 'Poppins, sans-serif' },
  logoSub: { color: '#a5b4fc', fontSize: 11 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 8,
    color: '#c7d2fe', textDecoration: 'none',
    fontSize: 14, fontWeight: 500,
    transition: 'all 0.2s',
  },
  navItemActive: { background: '#6366f1', color: 'white' },
  bottom: { padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#6366f1', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 14,
  },
  userName: { color: 'white', fontWeight: 600, fontSize: 13 },
  userRole: { color: '#a5b4fc', fontSize: 11, textTransform: 'capitalize' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '9px 12px',
    background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 8,
    color: '#fca5a5', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    transition: 'all 0.2s',
  },
};

export default Sidebar;
