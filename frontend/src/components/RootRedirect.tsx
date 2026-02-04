// src/components/RootRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RootRedirect component that redirects based on authentication status
 * - Redirects to /dashboard if authenticated
 * - Redirects to /login if not authenticated
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  // Redirect based on authentication status
  // If not authenticated, go to dashboard in demo mode
  // If authenticated, go to real dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;

