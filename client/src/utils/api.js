import axios from 'axios';
import { getLocalStorage, removeLocalStorage } from './jquery-utils';

// Configure axios defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5100',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getLocalStorage('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      removeLocalStorage('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 