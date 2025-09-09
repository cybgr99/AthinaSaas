import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './i18n';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  return user && isAdmin() ? children : <Navigate to="/dashboard" />;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" /> : <Login />
      } />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers/*" element={<Customers />} />
        <Route path="products/*" element={<Products />} />
        <Route path="orders/*" element={<Orders />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
