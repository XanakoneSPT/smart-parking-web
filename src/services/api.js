// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';  // Django API URL

export const apiService = {
  get: (endpoint) => axios.get(`${API_URL}${endpoint}`),
  post: (endpoint, data) => axios.post(`${API_URL}${endpoint}`, data),
  put: (endpoint, data) => axios.put(`${API_URL}${endpoint}`, data),
  delete: (endpoint) => axios.delete(`${API_URL}${endpoint}`)
};