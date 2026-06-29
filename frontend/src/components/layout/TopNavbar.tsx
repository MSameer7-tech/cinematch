import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Film } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

export const TopNavbar: FC = () => {
  const navigate = useNavigate();

  return (
    <header className="top-navbar">
      <div onClick={() => navigate('/')} className="brand-logo">
        <Film size={22} style={{ color: 'var(--primary-color)' }} />
        <span>CineMatch</span>
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
