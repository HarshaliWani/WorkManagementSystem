// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, tokenManager, User, LoginCredentials, RegisterData } from '../services/authService';

// AuthContextType interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean; // True when user is not authenticated (demo mode)
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;
  // Demo mode is active when user is not authenticated
  const isDemoMode = !isAuthenticated && !isLoading;

  // Initialize auth state from localStorage tokens on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if tokens exist in localStorage
        const accessToken = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();

        if (accessToken && refreshToken) {
          // Try to fetch user details
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (err: any) {
            // If fetching user fails, try to refresh token
            if (err.response?.status === 401) {
              try {
                const { access } = await authService.refreshToken(refreshToken);
                if (access) {
                  // Retry fetching user with new token
                  const userData = await authService.getCurrentUser();
                  setUser(userData);
                }
              } catch (refreshError: any) {
                // Refresh failed, clear tokens
                tokenManager.clearTokens();
                setUser(null);
              }
            } else {
              // Other error, clear tokens
              tokenManager.clearTokens();
              setUser(null);
            }
          }
        } else {
          // No tokens, user is not authenticated
          setUser(null);
        }
      } catch (err: any) {
        setError('Failed to initialize authentication');
        setUser(null);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      
      // Set user from response
      if (response.user) {
        setUser(response.user);
      } else {
        // If user not in response, fetch it
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (err: any) {
      let errorMessage = err.response?.data?.error || err.response?.data?.detail || 
        (err.code === 'ERR_NETWORK' ? 'Network error. Please check your connection.' : 'Login failed. Please check your credentials.');
      
      // Handle 403 - Not approved case
      if (err.response?.status === 403) {
        const detailMessage = err.response?.data?.detail || '';
        if (detailMessage.includes('not yet granted you access') || detailMessage.includes('wait for approval')) {
          errorMessage = 'Admin has not yet granted you access. Please wait for approval or contact the administrator.';
        }
      }
      
      setError(errorMessage);
      setUser(null);
      tokenManager.clearTokens();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);
      
      // Set user from response
      if (response.user) {
        setUser(response.user);
      } else {
        // If user not in response, fetch it
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 
        (err.code === 'ERR_NETWORK' ? 'Network error. Please check your connection.' : 'Registration failed. Please try again.');
      
      setError(errorMessage);
      setUser(null);
      tokenManager.clearTokens();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err: any) {
      // Even if logout fails, clear local state
    } finally {
      setUser(null);
      tokenManager.clearTokens();
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isDemoMode,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

