// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import CryptoJS from 'crypto-js';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nip: '',
    regon: '',
    city: '',
    street: '',
    buildingNumber: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const passwordHash = CryptoJS.SHA256(formData.password).toString(CryptoJS.enc.Hex);
      const dataToSend = {
        ...formData,
        passwordHash,
        password: undefined
      };
      const response = await authService.register(dataToSend);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
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

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">NIP</label>
            <input
              type="text"
              value={formData.nip}
              onChange={(e) => setFormData({...formData, nip: e.target.value})}
              pattern="\d{10}"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">REGON</label>
            <input
              type="text"
              value={formData.regon}
              onChange={(e) => setFormData({...formData, regon: e.target.value})}
              pattern="\d{9}"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Building Number</label>
            <input
              type="text"
              value={formData.buildingNumber}
              onChange={(e) => setFormData({...formData, buildingNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Register
          </button>

          <div className="text-center mt-4">
            Already have an account? {' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-700">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}