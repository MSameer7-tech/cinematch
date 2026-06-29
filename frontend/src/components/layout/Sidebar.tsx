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
  HelpCircle,
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
    title: 'Your Library',
    items: [
      { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
      { path: '/favorites', label: 'Favorites', icon: Heart },
      { path: '/recommendations', label: 'AI Picks', icon: Sparkles },
    ]
  },
  {
    title: 'Personal',
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

  const subtleDivider = (
    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.04)', margin: '12px 14px' }} />
  );

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Sidebar Header Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <div className="sidebar-logo">
              <Clapperboard size={22} style={{ color: 'var(--primary-color)' }} />
              <span>CineMatch</span>
            </div>
            <span className="sidebar-subtitle">AI-Powered Cinema</span>
          </div>
        </div>

        {/* Navigation Sections */}
        {sections.map((section, index) => (
          <div key={section.title}>
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
                            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.01) 100%)',
                            borderLeft: '4px solid var(--primary-color)',
                            boxShadow: '-4px 0 12px rgba(168, 85, 247, 0.15)',
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
            {/* Render a subtle divider between sections */}
            {index < sections.length - 1 && subtleDivider}
          </div>
        ))}

        {/* Upgrade to Pro hidden for now */}
      </div>

      {/* Footer / Logout */}
      <div className="sidebar-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
        {subtleDivider}
        <div className="sidebar-nav">
          <NavLink
            to="/help"
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            style={{ marginBottom: '4px' }}
          >
            {({ isActive }) => (
              <>
                <HelpCircle className="sidebar-icon" />
                <span style={{ position: 'relative', zIndex: 2 }}>Help</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.01) 100%)',
                      borderLeft: '4px solid var(--primary-color)',
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

          <button onClick={handleLogout} className="btn-logout">
            <LogOut className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
