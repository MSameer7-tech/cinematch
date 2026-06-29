import type { FC } from 'react';
import { Bell } from 'lucide-react';
import { SearchBar } from './SearchBar';

export const TopNavbar: FC = () => {
  return (
    <header className="top-navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed' }}>
      <SearchBar />

      <div className="navbar-actions" style={{ position: 'absolute', right: '40px' }}>
        <button className="icon-btn-nav" aria-label="Notifications">
          <Bell size={20} />
          <span className="nav-badge" />
        </button>
      </div>
    </header>
  );
};
