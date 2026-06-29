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
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: typeof House;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: House },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/trending', label: 'Trending', icon: Flame },
  { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/recommendations', label: 'AI Picks', icon: Sparkles },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
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
      <div className="sidebar-nav">
        {navItems.map((item) => (
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
                
                {/* Framer Motion sliding background pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(168, 85, 247, 0.09)',
                      borderLeft: '3px solid var(--primary-color)',
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

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <LogOut className="sidebar-icon" style={{ color: 'var(--danger-color)' }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
