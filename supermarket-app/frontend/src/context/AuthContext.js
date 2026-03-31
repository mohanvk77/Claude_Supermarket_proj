import React, { createContext, useContext, useState } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Role helpers
  const isAdmin   = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  const isCashier = user?.role === 'cashier';

  const can = (action) => {
    switch (action) {
      case 'view_dashboard':  return isAdmin || isManager;
      case 'view_sales':      return true;
      case 'create_sale':     return true;
      case 'view_products':   return isAdmin || isManager;
      case 'edit_products':   return isAdmin;
      case 'view_customers':  return isAdmin || isManager;
      case 'edit_customers':  return isAdmin || isManager;
      case 'view_reports':    return isAdmin || isManager;
      case 'manage_users':    return isAdmin;
      default: return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, isCashier, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
