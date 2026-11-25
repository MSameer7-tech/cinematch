import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { MobileNavbar } from '../components/layout/MobileNavbar';

export const MainLayout: FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAIPage = location.pathname === '/ai-picks' || location.pathname === '/ai';
  const mainRef = useRef<HTMLElement>(null);

  // Seamless scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return (
    <AppShell>
      <div className="app-layout">
        <TopNavbar />
        <div className="layout-body">
          <Sidebar />
          <main 
            ref={mainRef}
            className={`content-container ${isHome ? 'home-immersive' : isAIPage ? 'ai-immersive' : ''}`}
          >
            <div
              style={{ 
                width: '100%', 
                minHeight: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                flex: 1 
              }}
            >
              <Outlet />
            </div>
          </main>
        </div>
        <MobileNavbar />
      </div>
    </AppShell>
  );
};
