import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const UserMenu: FC = () => {
  const { authState, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isGuest = authState.status === 'GUEST';
  const user = authState.user;

  const displayName = isGuest ? 'Guest' : (user?.displayName || 'User');
  const avatarUrl = isGuest ? null : user?.avatarUrl;
  const email = isGuest ? 'Transient Session' : (user?.id ? 'Registered User' : '');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleItemClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 1).toUpperCase();
  };

  return (
    <div className="user-menu-container" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="user-avatar-trigger">
        <div className="avatar-circle">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="avatar-img" />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <span className="user-name-label">{displayName}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="user-dropdown"
          >
            <div className="dropdown-header">
              <div className="dropdown-user-name">{displayName}</div>
              <div className="dropdown-user-role">{email}</div>
            </div>

            <button onClick={() => handleItemClick('/profile')} className="dropdown-item">
              <User size={16} />
              <span>Profile</span>
            </button>

            <button onClick={() => handleItemClick('/settings')} className="dropdown-item">
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <button onClick={handleLogout} className="dropdown-item danger" style={{ borderTop: '1px solid var(--border-color)', borderRadius: 0, marginTop: '4px', paddingTop: '12px' }}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
