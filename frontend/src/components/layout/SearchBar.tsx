import { type FC, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSearchStore } from '../../features/search/stores/search.store';
import { SearchDropdown } from '../../features/search/components/SearchDropdown';
import { useFavorites } from '../../features/library/hooks/useFavorites';
import { useWatchlist } from '../../features/library/hooks/useWatchlist';

export const SearchBar: FC = () => {
  const navigate = useNavigate();
  const { query, setQuery } = useSearchStore();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: favorites } = useFavorites();
  const { data: watchlist } = useWatchlist();

  // Compute taste profile for suggested keywords personalization
  const userTasteProfile = useMemo(() => {
    const genres: string[] = [];
    const directors: string[] = [];
    const library = [...(favorites || []), ...(watchlist || [])];
    library.forEach((m: any) => {
      if (m.genres) m.genres.forEach((g: any) => genres.push(typeof g === 'string' ? g : g.name));
      if (m.director) directors.push(m.director);
    });
    return {
      favoriteGenres: Array.from(new Set(genres)),
      favoriteDirectors: Array.from(new Set(directors))
    };
  }, [favorites, watchlist]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      if (e.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      inputRef.current?.blur();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '440px',
        transition: 'max-width 0.25s ease'
      }}
      className="search-bar-wrapper"
    >
      <form onSubmit={handleSearch} className="search-container">
        {/* Search Icon on the left */}
        <Search 
          size={16}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isFocused ? '#c084fc' : 'rgba(255, 255, 255, 0.45)',
            pointerEvents: 'none',
            transition: 'color 0.2s ease',
            zIndex: 2,
          }}
        />

        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, genres, actors..." 
          className="search-input"
          style={{ 
            width: '100%',
            paddingLeft: '42px',
            paddingRight: query ? '40px' : '64px',
            height: '42px',
            fontSize: '13.5px',
            fontWeight: 500,
            borderRadius: '22px',
            backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            border: isFocused ? '1px solid rgba(168, 85, 247, 0.65)' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isFocused ? '0 0 24px rgba(168, 85, 247, 0.25), 0 4px 12px rgba(0,0,0,0.4)' : 'none',
            color: '#f8fafc',
            outline: 'none',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />

        {/* Clear query button when typing */}
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.2s ease',
              zIndex: 2
            }}
            title="Clear search"
          >
            <X size={12} />
          </button>
        ) : (
          /* Subtle Keyboard Shortcut Badge when empty */
          <div
            className="search-shortcut-badge"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none',
              userSelect: 'none',
              letterSpacing: '0.5px'
            }}
          >
            <span>⌘</span>
            <span>K</span>
          </div>
        )}
      </form>

      {/* Auto-suggest dropdown overlay panel */}
      {isFocused && (
        <SearchDropdown 
          onClose={() => setIsFocused(false)} 
          userTasteProfile={userTasteProfile}
        />
      )}
    </div>
  );
};

export default SearchBar;
