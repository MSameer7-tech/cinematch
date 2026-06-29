import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  House, 
  Compass, 
  Flame, 
  Bookmark, 
  Heart, 
  Sparkles, 
  User, 
  Settings, 
  LogOut,
  Clapperboard
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: typeof House;
}

interface Section {
  title: string;
  items: NavItem[];
}

const sections: Section[] = [
  {
    title: 'Discover',
    items: [
      { path: '/', label: 'Home', icon: House },
      { path: '/discover', label: 'Discover', icon: Compass },
      { path: '/trending', label: 'Trending', icon: Flame },
    ]
  },
  {
    title: 'Library',
    items: [
      { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
      { path: '/favorites', label: 'Favorites', icon: Heart },
      { path: '/recommendations', label: 'AI Picks', icon: Sparkles },
    ]
  },
  {
    title: 'Account',
    items: [
      { path: '/profile', label: 'Profile', icon: User },
      { path: '/settings', label: 'Settings', icon: Settings },
    ]
  }
];

export const Sidebar: FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div>
        {/* Sidebar Header Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <div className="sidebar-logo">
              <Clapperboard size={22} style={{ color: 'var(--primary-color)' }} />
              <span>CineMatch</span>
            </div>
            <span className="sidebar-subtitle">AI Movie Discovery</span>
          </div>
        </div>

        {/* Navigation Sections */}
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: '20px' }}>
            <div className="sidebar-section-label">{section.title}</div>
            <div className="sidebar-nav">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="sidebar-icon" />
                      <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>
                      
                      {/* Active Indicator Sliding Overlay */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.01) 100%)',
                            borderLeft: '4px solid var(--primary-color)',
                            boxShadow: '-4px 0 12px rgba(168, 85, 247, 0.2)',
                            borderRadius: 'var(--radius-button)',
                            zIndex: 1,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <LogOut className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
