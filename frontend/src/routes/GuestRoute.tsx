import { type FC, useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AuthCard } from '../features/auth/components/AuthCard';
import { HomePage } from '../features/home/pages/HomePage';

export const GuestRoute: FC = () => {
  const { authState, isInitializing } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [hasVisitedHome, setHasVisitedHome] = useState(isHome);

  useEffect(() => {
    if (isHome) {
      setHasVisitedHome(true);
    }
  }, [isHome]);

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.08) 0%, rgba(6, 6, 10, 1) 85%)',
        padding: '24px 16px',
      }}>
        <AuthCard title="CineMatch" subtitle="Preparing session...">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '36px 0' }}>
            <span className="dot" style={{ animationDelay: '0s' }} />
            <span className="dot" style={{ animationDelay: '0.2s' }} />
            <span className="dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </AuthCard>
      </div>
    );
  }

  if (authState.status === 'UNAUTHENTICATED') {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {hasVisitedHome && (
        <div style={{ display: isHome ? 'block' : 'none', width: '100%' }}>
          <HomePage />
        </div>
      )}
      {!isHome && <Outlet />}
    </>
  );
};
