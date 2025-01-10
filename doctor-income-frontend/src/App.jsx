// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Profile from './pages/Profile';
import Employers from './pages/Employers';
import Transactions from './pages/Transactions';
import EmployerDetail from './pages/EmployerDetail';
import TransactionDetail from './pages/TransactionDetail';
import Fakturownia from './pages/Fakturownia';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute check:', {
    hasToken: !!token,
    time: new Date().toISOString(),
    pathname: window.location.pathname
  });
  return token ? children : <Navigate to="/login" />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default function App() {
  useEffect(() => {
    const handleStorage = () => {
      console.log('Storage changed:', {
        hasToken: !!localStorage.getItem('token'),
        time: new Date().toISOString()
      });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  console.log('App rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/employers" element={<ProtectedRoute><Employers /></ProtectedRoute>} />
          <Route path="/employers/:id" element={<ProtectedRoute><EmployerDetail /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
          <Route path="/fakturownia" element={<ProtectedRoute><Fakturownia /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}