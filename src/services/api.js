// src/services/api.js
import axios from 'axios';

export const API_URL = 'http://localhost:8000/';

// Add authorization header to requests
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const apiService = {
  get: (endpoint) => axios.get(`${API_URL}${endpoint}`, { headers: getHeaders() }),
  post: (endpoint, data) => axios.post(`${API_URL}${endpoint}`, data, { headers: getHeaders() }),
  put: (endpoint, data) => axios.put(`${API_URL}${endpoint}`, data, { headers: getHeaders() }),
  delete: (endpoint) => axios.delete(`${API_URL}${endpoint}`, { headers: getHeaders() })
};