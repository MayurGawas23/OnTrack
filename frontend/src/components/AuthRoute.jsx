import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    if (!user.onboarded) {
      return <Navigate to="/onboard" replace />;
    }
    return <Navigate to="/tracker" replace />;
  }

  return children;
};

export default AuthRoute;
