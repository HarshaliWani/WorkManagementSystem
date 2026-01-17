// src/services/demoApi.ts
// Unauthenticated API instance for demo endpoints
import axios from 'axios';

/**
 * Get API base URL from environment variable
 * In production, VITE_API_BASE_URL or VITE_API_URL must be set
 */
const getApiBaseUrl = (): string => {
  // In production, environment variable must be set
  if (import.meta.env.PROD) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 
                    import.meta.env.VITE_API_URL?.replace('/api', '');
    if (!baseUrl) {
      throw new Error('VITE_API_BASE_URL or VITE_API_URL must be set in production environment');
    }
    return `${baseUrl}/api/demo`;
  }
  
  // Development fallback (only in dev mode)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 
                  import.meta.env.VITE_API_URL?.replace('/api', '') || 
                  'http://localhost:8000';
  return `${baseUrl}/api/demo`;
};

const demoApi = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
demoApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error('[DemoAPI] Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
demoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error('[DemoAPI] Response error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    // Don't redirect to login for demo API errors - just reject the promise
    // This prevents the authenticated API interceptor from catching demo errors
    return Promise.reject(error);
  }
);

export default demoApi;

