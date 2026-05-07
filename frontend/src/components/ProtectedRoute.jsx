import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarded && !user.onboarded) {
    return <Navigate to="/onboard" replace />;
  }

  if (!requireOnboarded && user.onboarded) {
    return <Navigate to="/tracker" replace />;
  }

  return children;
};

export default ProtectedRoute;
