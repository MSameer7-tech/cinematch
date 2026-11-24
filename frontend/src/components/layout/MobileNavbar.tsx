import type { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  Bookmark, 
  Settings 
} from 'lucide-react';
import './MobileNavbar.css';

// Custom Home Icon matching CineMatch's filled purple look
const HomeIcon = ({ isActive, size = 20 }: { isActive: boolean; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={isActive ? "#8B5CF6" : "none"} 
    stroke={isActive ? "#8B5CF6" : "currentColor"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path 
      d="M3 10.2L12 3L21 10.2V20C21 20.55 20.55 21 20 21H15V14.5H9V21H4C3.45 21 3 20.55 3 20V10.2Z" 
      fill={isActive ? "#8B5CF6" : "none"} 
    />
  </svg>
);

interface MobileNavItem {
  id: string;
  label: string;
  path: string;
  isActive: (pathname: string) => boolean;
  renderIcon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    isActive: (p) => p === '/',
    renderIcon: (active) => <HomeIcon isActive={active} size={20} />,
  },
  {
    id: 'discover',
    label: 'Discover',
    path: '/discover',
    isActive: (p) => p.startsWith('/discover'),
    renderIcon: (active) => (
      <Compass 
        size={20} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.3 : 1.8} 
      />
    ),
  },
  {
    id: 'ai-picks',
    label: 'AI Picks',
    path: '/ai-picks',
    isActive: (p) => p === '/ai-picks' || p === '/ai',
    renderIcon: (active) => (
      <Sparkles 
        size={20} 
        fill={active ? "rgba(139, 92, 246, 0.4)" : "none"} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.3 : 1.8} 
      />
    ),
  },
  {
    id: 'library',
    label: 'Library',
    path: '/watchlist',
    isActive: (p) => p === '/watchlist' || p === '/favorites' || p === '/ratings',
    renderIcon: (active) => (
      <Bookmark 
        size={19} 
        fill={active ? "#8B5CF6" : "none"} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.3 : 1.8} 
      />
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    isActive: (p) => p === '/settings' || p === '/profile',
    renderIcon: (active) => (
      <Settings 
        size={20} 
        stroke={active ? "#8B5CF6" : "currentColor"} 
        strokeWidth={active ? 2.3 : 1.8} 
      />
    ),
  },
];

export const MobileNavbar: FC = () => {
  const location = useLocation();

  return (
    <nav className="mobile-navbar" aria-label="Mobile Navigation">
      {NAV_ITEMS.map((item) => {
        const active = item.isActive(location.pathname);
        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={`mobile-nav-item ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <div className="mobile-nav-icon-container">
              {item.renderIcon(active)}
            </div>
            <span className="mobile-nav-label">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNavbar;
