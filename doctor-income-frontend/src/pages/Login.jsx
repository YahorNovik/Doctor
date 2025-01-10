// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import CryptoJS from 'crypto-js';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const passwordHash = CryptoJS.SHA256(formData.password).toString(CryptoJS.enc.Hex);
      console.log('Attempting login...');
      const response = await authService.login({
        email: formData.email,
        passwordHash: passwordHash
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.username);
      navigate('/'); 
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Login
          </button>
          <div className="text-center mt-4">
            Don&apos;t have an account? {' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-700">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}