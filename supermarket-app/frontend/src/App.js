import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Users from './pages/Users';
import './styles/global.css';

const PrivateRoute = ({ children, permission }) => {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !can(permission)) return <Navigate to="/sales" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute permission="view_dashboard"><Dashboard /></PrivateRoute>} />
          <Route path="/sales"     element={<PrivateRoute permission="view_sales"><Sales /></PrivateRoute>} />
          <Route path="/products"  element={<PrivateRoute permission="view_products"><Products /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute permission="view_customers"><Customers /></PrivateRoute>} />
          <Route path="/reports"   element={<PrivateRoute permission="view_reports"><Reports /></PrivateRoute>} />
          <Route path="/users"     element={<PrivateRoute permission="manage_users"><Users /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
