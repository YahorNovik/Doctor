// src/services/api.js
import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
 baseURL: 'https://doctor-backend-yw87.onrender.com/api'
});

axiosRetry(api, { 
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 401;
    }
  });

// Request interceptor
api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      console.log('Making request to:', config.url);
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Token attached to request');
      }
      
      return config;
    },
    error => {
      console.error('Request failed:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', {
        url: error.config?.url,
        message: error.message,
        status: error.response?.status,
        time: new Date().toISOString()
      });
  
      if (error.message === 'Network Error') {
        console.log('Network error detected - server might be down');
        // Optional: Show user-friendly message
        // alert('Connection lost. Please check your internet connection.');
        return Promise.reject(new Error('Connection lost. Please try again.'));
      }
  
      if (error.response?.status === 401) {
        console.log('Authentication error - logging out');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
  
      return Promise.reject(error);
    }
  );

export const profileService = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (id, data) => {
      console.log('Sending update with data:', data); // Log outgoing data
      return api.put(`/users/${id}`, data);
    },
    createProfile: (data) => api.post('/users', data),
    getAllProfiles: () => api.get('/users')
  };

export const authService = {
 login: (data) => api.post('/auth/login', data),
 register: (data) => api.post('/auth/register', data)
};

export const employerService = {
  getAll: () => {
    console.log('Calling getAll employers');
    return api.get('/employers');
  },
  getOne: (id) => api.get(`/employers/${id}`),
  create: (data) => api.post('/employers', data),
  update: (id, data) => api.put(`/employers/${id}`, data),
  delete: (id) => api.delete(`/employers/${id}`),
  getByNip: (nip) => api.get(`/employers/nip/${nip}`),
  sync: (clients) => api.post('/employers/sync', clients)
 };

export const transactionService = {
 getAll: (params) => api.get('/transactions', { params }),
 getOne: (id) => api.get(`/transactions/${id}`),
 create: (data) => api.post('/transactions', data),
 update: (id, data) => api.put(`/transactions/${id}`, data),
 delete: (id) => api.delete(`/transactions/${id}`)
};

export const productService = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  delete: (id) => {
    console.log('Deleting product with ID:', id, 'URL:', `/products/${id}`);
    return api.delete(`/products/${id}`);
  }
};

export const invoiceService = {
  getAll: () => api.get('/invoices'),
  getByEmployer: (employerId) => api.get(`/invoices/employer/${employerId}`),
  create: (data) => api.post('/invoices', data)
};

export default api;