import { type FC, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearchStore } from '../../features/search/stores/search.store';
import { SearchDropdown } from '../../features/search/components/SearchDropdown';
import { useFavorites } from '../../features/library/hooks/useFavorites';
import { useWatchlist } from '../../features/library/hooks/useWatchlist';

export const SearchBar: FC = () => {
  const navigate = useNavigate();
  const { query, setQuery } = useSearchStore();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', maxWidth: '360px' }}
      className="search-bar-wrapper"
    >
      <form onSubmit={handleSearch} className="search-container">
        <input 
          type="text" 
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or paste link" 
          className="search-input"
          style={{ width: '100%' }}
        />
        <Search className="search-icon" />
      </form>

      {/* Auto-suggest dropdown overlay panel (Phase 6 Autocomplete) */}
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
