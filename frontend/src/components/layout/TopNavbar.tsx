import type { FC } from 'react';
import { Bell, Clapperboard, Menu } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

export const TopNavbar: FC = () => {
  return (
    <header className="top-navbar">
      {/* Mobile Menu & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="icon-btn-nav mobile-menu-btn" aria-label="Open Menu" style={{ display: 'none' }}>
          <Menu size={20} />
        </button>
        <div className="mobile-brand-logo">
          <Clapperboard size={20} style={{ color: 'var(--primary-color)' }} />
          <span>CineMatch</span>
        </div>
      </div>

      <SearchBar />

      <div className="navbar-actions">
        <button className="icon-btn-nav" aria-label="Notifications">
          <Bell size={20} />
          <span className="nav-badge" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
};
