import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdShoppingCart, MdInventory2,
  MdPeople, MdBarChart, MdLogout, MdStorefront,
  MdAdminPanelSettings
} from 'react-icons/md';

const Sidebar = () => {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  const allNavItems = [
    { to: '/dashboard',  icon: <MdDashboard size={20} />,          label: 'Dashboard',  permission: 'view_dashboard'  },
    { to: '/sales',      icon: <MdShoppingCart size={20} />,        label: 'Sales',      permission: 'view_sales'      },
    { to: '/products',   icon: <MdInventory2 size={20} />,          label: 'Products',   permission: 'view_products'   },
    { to: '/customers',  icon: <MdPeople size={20} />,              label: 'Customers',  permission: 'view_customers'  },
    { to: '/reports',    icon: <MdBarChart size={20} />,            label: 'Reports',    permission: 'view_reports'    },
    { to: '/users',      icon: <MdAdminPanelSettings size={20} />,  label: 'Users',      permission: 'manage_users'    },
  ];

  const navItems = allNavItems.filter(item => can(item.permission));

  const roleBadgeColor = {
    admin:   '#6366f1',
    manager: '#22c55e',
    cashier: '#f59e0b',
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}>
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
            <span style={{ ...styles.roleBadge, background: roleBadgeColor[user?.role] || '#6366f1' }}>
              {user?.role}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <MdLogout size={18} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: { position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: '#1e1b4b', display: 'flex', flexDirection: 'column', zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoTitle: { color: 'white', fontWeight: 700, fontSize: 16, fontFamily: 'Poppins, sans-serif' },
  logoSub: { color: '#a5b4fc', fontSize: 11 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, color: '#c7d2fe', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  navItemActive: { background: '#6366f1', color: 'white' },
  bottom: { padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  userName: { color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 3 },
  roleBadge: { fontSize: 10, fontWeight: 700, color: 'white', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 8, color: '#fca5a5', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
};

export default Sidebar;
