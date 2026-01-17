// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that wraps routes
 * - Shows loading state while checking authentication
 * - Allows access in demo mode (unauthenticated) or when authenticated
 * - Only redirects to login if trying to access edit/create operations without auth
 * - Renders children in both demo mode and authenticated mode
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isDemoMode } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access in demo mode or when authenticated
  // Demo mode allows viewing, authenticated mode allows full access
  if (isDemoMode || isAuthenticated) {
    return <>{children}</>;
  }

  // This should rarely happen, but if somehow neither demo nor auth, redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;

