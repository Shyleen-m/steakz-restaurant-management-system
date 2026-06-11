import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred';
    
    // Handle Unauthorized (Token Expired)
    if (error.response?.status === 401) {
      console.error('[API] Unauthorized access - redirecting to login or refreshing token');
      // Potential logic: localStorage.removeItem('token'); window.location.href = '/login';
    }

    // Log enterprise-level errors
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);

    return Promise.reject(error);
  }
);

export default api;
