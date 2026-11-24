import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export const TopNavbar: FC = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const containerScrollY = document.querySelector('.content-container')?.scrollTop || 0;
      const currentScroll = Math.max(scrollY, containerScrollY);
      setIsAtTop(currentScroll < 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const container = document.querySelector('.content-container');
    container?.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`top-navbar ${isAtTop ? 'at-top' : 'scrolled'}`}>
      {/* Mobile Brand Logo: Only visible when sidebar is hidden on small mobile viewports */}
      <div className="mobile-navbar-logo">
        <NavLink
          to="/"
          title="CineMatch"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <img 
            src="/logo.png" 
            alt="CineMatch" 
            style={{ 
              width: '32px', 
              height: '32px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 10px rgba(139, 92, 246, 0.45))'
            }} 
          />
        </NavLink>
      </div>

      {/* Centered Search Bar */}
      <div className="top-navbar-search" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <SearchBar />
      </div>
    </header>
  );
};
