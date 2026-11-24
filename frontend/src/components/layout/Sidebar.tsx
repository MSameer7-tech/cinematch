import { type FC, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Sparkles,
  Bookmark, 
  Heart, 
  Star, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

// 1. Home Icon matching the solid purple silhouette
const HomeIcon = ({ isActive, size = 22 }: { isActive: boolean; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={isActive ? "#8B5CF6" : "none"} 
    stroke={isActive ? "#8B5CF6" : "currentColor"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ transition: 'all 0.2s ease' }}
  >
    <path 
      d="M3 10.2L12 3L21 10.2V20C21 20.55 20.55 21 20 21H15V14.5H9V21H4C3.45 21 3 20.55 3 20V10.2Z" 
      fill={isActive ? "#8B5CF6" : "none"} 
    />
  </svg>
);

interface NavItem {
  path: string;
  label: string;
  render: (isActive: boolean) => React.ReactNode;
}

// Exactly: Home, Explore, AI Assistant, Watchlist, Favorites, Ratings, Settings
const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    render: (active) => <HomeIcon isActive={active} size={22} />,
  },
  {
    path: '/discover',
    label: 'Explore',
    render: (active) => (
      <Compass 
        size={22} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.2 : 1.9} 
      />
    ),
  },
  {
    path: '/ai-picks',
    label: 'AI Assistant',
    render: (active) => (
      <Sparkles 
        size={22} 
        fill={active ? "rgba(139, 92, 246, 0.35)" : "none"} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.2 : 1.9} 
      />
    ),
  },
  {
    path: '/watchlist',
    label: 'Watchlist',
    render: (active) => (
      <Bookmark 
        size={21} 
        fill={active ? "#8B5CF6" : "none"} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2 : 1.9} 
      />
    ),
  },
  {
    path: '/favorites',
    label: 'Favorites',
    render: (active) => (
      <Heart 
        size={21} 
        fill={active ? "#8B5CF6" : "none"} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2 : 1.9} 
      />
    ),
  },
  {
    path: '/ratings',
    label: 'Ratings',
    render: (active) => (
      <Star 
        size={21} 
        fill={active ? "#8B5CF6" : "none"} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2 : 1.9} 
      />
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    render: (active) => (
      <Settings 
        size={22} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.2 : 1.9} 
      />
    ),
  },
];

export const Sidebar: FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside
      className="sidebar"
      style={{
        width: '76px',
        position: 'fixed',
        top: 0,
        height: '100vh',
        bottom: 0,
        left: 0,
        background: 'var(--bg-primary, #07070D)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: 'none',
        borderRight: 'none',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0 20px 0',
        zIndex: 55,
      }}
    >
      {/* Top Section: Brand Logo & Primary Navigation Rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Brand Logo at the top of the solid sidebar */}
        <div 
          style={{ 
            height: 'var(--navbar-height, 72px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
          }}
        >
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
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
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

        {/* Navigation Items: Home, Explore, AI Assistant, Watchlist, Favorites, Ratings, Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', marginTop: '18px' }}>
          {navItems.map((item) => {
            const isHovered = hoveredPath === item.path;

            return (
              <div
                key={item.path}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    position: 'relative',
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#8B5CF6' : isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                    backgroundColor: isHovered && !isActive 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'transparent',
                    transition: 'color 0.2s ease',
                    textDecoration: 'none',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '14px',
                            backgroundColor: 'rgba(139, 92, 246, 0.16)',
                            border: '1px solid rgba(139, 92, 246, 0.35)',
                            zIndex: 0,
                          }}
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.render(isActive)}
                      </span>
                    </>
                  )}
                </NavLink>

                {/* Clean Frosted Glass Tooltip */}
                {hoveredPath === item.path && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '58px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(14, 14, 24, 0.92)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      pointerEvents: 'none',
                      zIndex: 100,
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Help & Logout Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
        {/* Help Button */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setHoveredPath('/help')}
          onMouseLeave={() => setHoveredPath(null)}
        >
          <NavLink
            to="/help"
            style={({ isActive }) => ({
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? '#ffffff' : hoveredPath === '/help' ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
              backgroundColor: hoveredPath === '/help' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            })}
          >
            <HelpCircle size={18} />
          </NavLink>
          {hoveredPath === '/help' && (
            <div
              style={{
                position: 'absolute',
                left: '52px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(14, 14, 24, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              Help
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setHoveredPath('logout')}
          onMouseLeave={() => setHoveredPath(null)}
        >
          <button
            onClick={handleLogout}
            aria-label="Logout"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hoveredPath === 'logout' ? '#ef4444' : 'rgba(255, 255, 255, 0.35)',
              backgroundColor: hoveredPath === 'logout' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={18} />
          </button>
          {hoveredPath === 'logout' && (
            <div
              style={{
                position: 'absolute',
                left: '52px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(14, 14, 24, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#ef4444',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              Logout
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
