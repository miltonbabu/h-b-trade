import axios from 'axios';

// In-memory cache for GET requests with TTL
const cache = new Map<string, { data: any; expires: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.hbtrade.ltd/api';

// Detect the #1 production misconfiguration: NEXT_PUBLIC_API_URL was never set on
// the host (e.g. Vercel), so the build falls back to localhost and a browser on the
// live domain can't reach the API.
export const isApiMisconfigured = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);
  const apiPointsToLocalhost = /localhost|127\.0\.0\.1/.test(API_URL);
  return !isLocalHost && apiPointsToLocalhost;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Caching request interceptor for GET requests
api.interceptors.request.use(
  (config) => {
    // Check cache for GET requests
    if (config.method?.toLowerCase() === 'get') {
      const cacheKey = `${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
      const cached = cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return Promise.reject({ cached: true, data: cached.data, status: 200 });
      }
    }
    
    // Let browser set Content-Type for FormData (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (typeof window !== 'undefined') {
      // For admin routes, use admin token
      if (config.url?.startsWith('/admin') || config.url?.startsWith('/auth')) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // For customer/public routes, prefer customer token
        const customerToken = localStorage.getItem('customer_token');
        const adminToken = localStorage.getItem('token');
        const token = customerToken || adminToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to invalidate cache
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Handle response with caching and error handling
api.interceptors.response.use(
  (response) => {
    if (response.config?.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${response.config.params ? JSON.stringify(response.config.params) : ''}`;
      const ttl = (response.config as any).cacheTTL || DEFAULT_TTL;
      cache.set(cacheKey, {
        data: response,
        expires: Date.now() + ttl,
      });
    }
    return response;
  },
  (error) => {
    if (error.cached && error.status === 200) {
      return Promise.resolve(error.data);
    }
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        if (window.location.pathname.startsWith('/admin')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/admin/login';
        } else if (window.location.pathname.startsWith('/profile')) {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
