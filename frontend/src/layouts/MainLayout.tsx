import type { FC } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';

export const MainLayout: FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AppShell>
      <div className="app-layout">
        <TopNavbar />
        <div className="layout-body">
          <Sidebar />
          <main className={`content-container ${isHome ? 'home-immersive' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%' }}
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
