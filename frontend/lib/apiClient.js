import axios from 'axios';

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000, // Reduced from 30s to 10s for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and caching
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add caching for GET requests
    if (config.method === 'get') {
      const cacheKey = config.url + JSON.stringify(config.params || {});
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        config.cachedData = cached.data;
      }
    }
  }
  return config;
});

// Response interceptor - handle 401 and cache responses
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    // A 401 from the login/register attempt itself just means wrong
    // credentials - don't redirect, let the page show the error message.
    const isAuthAttempt = /^\/auth\/(login|register)/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthAttempt) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;