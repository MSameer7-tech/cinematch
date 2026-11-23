import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';

export const MainLayout: FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
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
            className={`content-container ${isHome ? 'home-immersive' : ''}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ 
                  width: '100%', 
                  minHeight: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  flex: 1 
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AppShell>
  );
};
