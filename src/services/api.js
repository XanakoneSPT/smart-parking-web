// src/services/api.js
import axios from 'axios';

// Make sure this URL matches your backend server
export const API_URL = 'http://localhost:8000/';

// Add authorization header to requests
const getHeaders = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  console.log('Current auth token:', token);
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Add axios interceptor to handle token expiration
const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized access detected, clearing auth data');
        // Clear auth data on token expiration
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        sessionStorage.removeItem('user_info');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Initialize interceptors
setupAxiosInterceptors();

console.log('API Service initialized with URL:', API_URL);

export const apiService = {
  get: (endpoint) => axios.get(`${API_URL}${endpoint}`, { headers: getHeaders() }),
  post: (endpoint, data) => axios.post(`${API_URL}${endpoint}`, data, { headers: getHeaders() }),
  put: (endpoint, data) => axios.put(`${API_URL}${endpoint}`, data, { headers: getHeaders() }),
  delete: (endpoint) => axios.delete(`${API_URL}${endpoint}`, { headers: getHeaders() }),
  
  // Specialized login method that maps frontend fields to backend expected fields
  login: (username, password) => {
    console.log('Attempting login with:', { username });
    return axios.post(`${API_URL}api_users/login/`, {
      ma_qtv: username, // Map username to MaQTV field
      mat_khau: password // Map password to MatKhau field
    });
  }
};