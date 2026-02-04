// src/services/axiosConfig.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenManager } from './tokenManager';

/**
 * Get API base URL from environment variable
 * In production, VITE_API_URL must be set - no localhost fallback
 */
const getApiBaseUrl = (): string => {
  // In production, environment variable must be set
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL must be set in production environment');
    }
    return apiUrl;
  }
  
  // Development fallback (only in dev mode)
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

/**
 * Create authenticated axios instance with automatic token management
 */
const createAuthenticatedAxios = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Add Authorization header with Bearer token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      // Only log errors in development
      if (import.meta.env.DEV) {
        console.error('[AxiosInterceptor] Request: Request interceptor error', {
          error: error.message,
          url: error.config?.url,
        });
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle token refresh on 401 errors
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only log errors in development
      if (import.meta.env.DEV) {
        console.error('[AxiosInterceptor] Response: Request failed', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
        });
      }

      // If error is 401 and we haven't already tried to refresh
      // Skip refresh for auth endpoints (login, register, token refresh) to avoid loops
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
      const refreshToken = tokenManager.getRefreshToken();
      
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && refreshToken) {
        originalRequest._retry = true;

        try {
          // Import authService dynamically to avoid circular dependency
          const { authService } = await import('./authService');
          const { access } = await authService.refreshToken(refreshToken);
          
          if (access && originalRequest.headers) {
            // Update access token in localStorage (already done in refreshToken)
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return instance(originalRequest);
          } else {
            throw new Error('No access token received from refresh');
          }
        } catch (refreshError: any) {
          // Only log errors in development
          if (import.meta.env.DEV) {
            console.error('[AxiosInterceptor] Response: Token refresh failed', {
              error: refreshError.message,
              status: refreshError.response?.status,
              url: originalRequest.url,
            });
          }
          
          // Refresh failed, clear tokens and redirect to login
          tokenManager.clearTokens();
          
          // Show token expiry notification
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            // Dispatch custom event for token expiry notification
            window.dispatchEvent(new CustomEvent('token-expired', { 
              detail: { message: 'Your session has expired. Please log in again.' } 
            }));
            
            // Redirect to login page
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else if (error.response?.status === 401 && !refreshToken) {
        // No refresh token available, don't try to refresh
        // Don't redirect if we're already on login/register page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && !isAuthEndpoint) {
          tokenManager.clearTokens();
          window.location.href = '/login';
        }
      }

      // Handle network errors - only log in development
      if ((error.code === 'ERR_NETWORK' || error.message === 'Network Error') && import.meta.env.DEV) {
        console.error('[AxiosInterceptor] Response: Network error detected', {
          url: originalRequest?.url,
          message: 'Unable to connect to server. Please check your internet connection.',
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Export the authenticated axios instance
export const authenticatedApi = createAuthenticatedAxios();

export default authenticatedApi;

