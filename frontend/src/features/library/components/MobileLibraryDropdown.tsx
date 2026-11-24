import { useState, useRef, useEffect, type FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Bookmark, Heart, Star, Check } from 'lucide-react';

interface LibrarySectionSelectorProps {
  currentSection: 'watchlist' | 'favorites' | 'ratings';
}

const SECTIONS = [
  { id: 'watchlist', label: 'Watchlist', path: '/watchlist', icon: Bookmark },
  { id: 'favorites', label: 'Favorites', path: '/favorites', icon: Heart },
  { id: 'ratings', label: 'Ratings', path: '/ratings', icon: Star },
] as const;

export const MobileLibraryDropdown: FC<LibrarySectionSelectorProps> = ({ currentSection }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSection = SECTIONS.find((s) => s.id === currentSection) || SECTIONS[0];
  const ActiveIcon = activeSection.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="mobile-library-dropdown-container" ref={containerRef}>
      <button
        type="button"
        className="mobile-library-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="mobile-library-dropdown-label">
          <ActiveIcon size={16} className="mobile-library-dropdown-icon" />
          <span>{activeSection.label}</span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.8
          }} 
        />
      </button>

      {isOpen && (
        <div className="mobile-library-dropdown-menu">
          {SECTIONS.map((section) => {
            const isSelected = section.id === currentSection;
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                className={`mobile-library-dropdown-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setIsOpen(false);
                  if (!isSelected) {
                    navigate(section.path);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} />
                  <span>{section.label}</span>
                </div>
                {isSelected && <Check size={15} style={{ color: '#a855f7' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
