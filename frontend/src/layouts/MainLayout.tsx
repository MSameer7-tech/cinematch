import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';

export const MainLayout: FC = () => {
  return (
    <AppShell>
      <div className="app-layout">
        <TopNavbar />
        <div className="layout-body">
          <Sidebar />
          <main className="content-container">
            <Outlet />
          </main>
        </div>
      </div>
    </AppShell>
  );
};
