// src/services/authService.ts
import api from './api';
import { tokenManager } from './tokenManager';

// TypeScript interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

// Re-export AuthTokens from tokenManager
export type { AuthTokens } from './tokenManager';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

export interface AuthResponse {
  user: User;
  tokens?: AuthTokens;
  access?: string;
  refresh?: string;
}

// Re-export tokenManager for backward compatibility
export { tokenManager } from './tokenManager';

export const authService = {
  /**
   * Register a new user
   * POST /api/auth/register/
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register/', data);
      const responseData = response.data;
      
      // Save tokens if provided
      if (responseData.tokens) {
        tokenManager.saveTokens(responseData.tokens);
      }
      
      return responseData;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Login user
   * POST /api/auth/login/
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const responseData = response.data;
      
      // Save tokens
      if (responseData.access && responseData.refresh) {
        tokenManager.saveTokens({
          access: responseData.access,
          refresh: responseData.refresh,
        });
      }
      
      return responseData;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Logout user (blacklist refresh token)
   * POST /api/auth/logout/
   */
  logout: async (refreshToken: string): Promise<void> => {
    try {
      await api.post('/auth/logout/', { refresh_token: refreshToken });
    } catch (error: any) {
      // Even if logout fails on server, clear local tokens
    } finally {
      // Always clear tokens from localStorage
      tokenManager.clearTokens();
    }
  },

  /**
   * Refresh access token
   * POST /api/auth/token/refresh/
   */
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    try {
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      
      const newAccessToken = response.data.access;
      
      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }
      
      // Update access token in localStorage
      const currentRefreshToken = tokenManager.getRefreshToken();
      if (currentRefreshToken) {
        tokenManager.saveTokens({
          access: newAccessToken,
          refresh: currentRefreshToken,
        });
      }
      
      return { access: newAccessToken };
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get current authenticated user details
   * GET /api/auth/user/
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/user/');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

