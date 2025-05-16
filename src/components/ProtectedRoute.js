import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();
  
  // DEVELOPMENT MODE: Bypass authentication
  const bypassAuth = true; // Set to false to re-enable authentication
  
  useEffect(() => {
    console.log('ProtectedRoute status:', {
      bypassAuth,
      isAuthenticated,
      currentUser,
      loading,
      path: location.pathname,
    });
  }, [bypassAuth, isAuthenticated, currentUser, loading, location]);
  
  if (bypassAuth) {
    console.log('Authentication bypassed for', location.pathname);
    return children;
  }

  // Show loading state while auth status is being determined
  if (loading) {
    console.log('Loading authentication state...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check for it
  if (requiredRole && currentUser.role !== requiredRole) {
    console.log(`Role check failed: Required ${requiredRole}, has ${currentUser.role}`);
    // Redirect to appropriate page based on user's role
    return <Navigate to={currentUser.role === 'Admin' ? '/admin' : '/dashboard'} replace />;
  }

  // User is authenticated and has required role, render the protected component
  console.log('Authentication successful, rendering protected content');
  return children;
};

export default ProtectedRoute; 