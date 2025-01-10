// src/services/employerService.js
import api from './api';

export const employerService = {
  getAll: () => api.get('/employers'),
  getOne: (id) => api.get(`/employers/${id}`),
  create: async (data) => {
    try {
      const response = await api.post('/employers', data);
      return response;
    } catch (error) {
      console.error('Error creating employer:', error.response?.data || error.message);
      throw error;
    }
  },
  update: (id, data) => api.put(`/employers/${id}`, data),
  delete: (id) => api.delete(`/employers/${id}`)
};