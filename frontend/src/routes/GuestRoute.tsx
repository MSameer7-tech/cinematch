import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const GuestRoute: React.FC = () => {
  const { authState } = useAuth();

  if (authState.status === 'LOADING') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (authState.status === 'UNAUTHENTICATED') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
