// Helper to map id to _id for products loaded from products.json
export function normalizeProduct(product) {
  if (!product) return product;
  if (product._id) return product;
  return { ...product, _id: product.id };
}
import axios from 'axios';

const API_URL = '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add /api prefix to all requests
api.interceptors.request.use((config) => {
  // Add /api prefix to the URL if it doesn't start with /api
  if (!config.url.startsWith('/api')) {
    config.url = '/api' + config.url;
  }
  console.log('🔍 API Request URL:', config.baseURL + config.url);
  console.log('🔍 API Request params:', config.params);
  return config;
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.message);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login for specific authenticated routes
      const currentPath = window.location.pathname;
      const authRequiredPaths = ['/profile', '/my-orders'];
      
      if (authRequiredPaths.includes(currentPath)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
