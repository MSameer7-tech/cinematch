import type { FC } from 'react';
import { Bell } from 'lucide-react';
import { SearchBar } from './SearchBar';

export const TopNavbar: FC = () => {
  return (
    <header className="top-navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Left spacer block of equivalent size to center search bar */}
      <div style={{ width: '36px' }} />

      <SearchBar />

      <div className="navbar-actions" style={{ marginLeft: '0' }}>
        <button className="icon-btn-nav" aria-label="Notifications">
          <Bell size={20} />
          <span className="nav-badge" />
        </button>
      </div>
    </header>
  );
};
