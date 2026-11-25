import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useSearchStore } from '../stores/search.store';
import { MovieCard } from '../../movies/components/card/MovieCard';
import { MovieCardSkeleton } from '../../../components/loading/MovieCardSkeleton';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../../auth/hooks/useAuth';
import indexService from '../services/index.service';
import type { SortOption } from '../types/search.types';
import { 
  Search, 
  SlidersHorizontal
} from 'lucide-react';
import './SearchPage.css';

const SentinelCard: React.FC<{ onVisible: () => void }> = ({ onVisible }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onVisible();
      }
    }, { rootMargin: '0px 0px 400px 0px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible]);
  return <div ref={ref} style={{ height: '10px', width: '100%', gridColumn: '1 / -1' }} />;
};

export const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  
  const { 
    setQuery, 
    filters, 
    setFilters, 
    resetFilters, 
    sort, 
    setSort 
  } = useSearchStore();

  const { results, loading, hasMore, loadNextPage } = useSearch();

  // Collapsible Filters Drawer state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Available metadata for filters
  const bootstrap = indexService.getIndex();

  // Sync URL query param to search store
  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [queryParam, setQuery]);

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.genres && filters.genres.length > 0) count += filters.genres.length;
    if (filters.ratingMin) count += 1;
    if (filters.yearMin || filters.yearMax) count += 1;
    if (filters.language) count += 1;
    return count;
  }, [filters]);

  const handleMovieClick = (movieId: number, index: number) => {
    if (user?.id) {
      analyticsService.logMovieClicked(user.id, movieId, index + 1);
    }
    navigate(`/movie/${movieId}`);
  };

  const handleGenreToggle = (genreName: string) => {
    const active = filters.genres || [];
    const updated = active.includes(genreName)
      ? active.filter((g) => g !== genreName)
      : [...active, genreName];
    setFilters({ genres: updated });
  };

  return (
    <div className="search-page-container">
      
      {/* 1. Header Row */}
      <div className="search-header-row">
        <div className="search-title-block">
          <h1 className="search-title-heading">
            {queryParam ? `Search Results for "${queryParam}"` : 'Explore CineMatch'}
          </h1>
          <span className="search-subtitle-stats">
            {loading && results.length === 0 
              ? 'Searching our cinematic catalog...'
              : `${results.length} titles found`}
          </span>
        </div>
      </div>

      {/* 2. Top Control Bar (Content Type Tabs + Sort + Filter Toggle) */}
      <div className="search-control-bar">
        {/* Content Type Tabs */}
        <div className="search-type-tabs">
          <button
            className={`type-tab-btn ${(!filters.contentType || filters.contentType === 'both') ? 'active' : ''}`}
            onClick={() => setFilters({ contentType: 'both' })}
          >
            All
          </button>
          <button
            className={`type-tab-btn ${filters.contentType === 'movie' ? 'active' : ''}`}
            onClick={() => setFilters({ contentType: 'movie' })}
          >
            Movies
          </button>
          <button
            className={`type-tab-btn ${filters.contentType === 'tv' ? 'active' : ''}`}
            onClick={() => setFilters({ contentType: 'tv' })}
          >
            Series
          </button>
        </div>

        {/* Right Side: Quick Sort & Filters Toggle */}
        <div className="search-actions-right">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="search-sort-select"
            aria-label="Sort search results"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="popularity">Sort: Most Popular</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="alphabetical">Sort: A to Z</option>
          </select>

          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`btn-filter-toggle ${isFiltersOpen ? 'active' : ''}`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge-pill">{activeFiltersCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Collapsible Filter Drawer */}
      {isFiltersOpen && (
        <div className="search-filter-drawer">
          <div className="filter-drawer-header">
            <div className="filter-drawer-title">
              <SlidersHorizontal size={14} color="#c084fc" />
              <span>Refine Search</span>
            </div>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="btn-reset-filters">
                Reset All Filters
              </button>
            )}
          </div>

          <div className="filter-controls-row">
            {/* Genres */}
            <div>
              <span className="filter-group-label">Genres</span>
              <div className="genre-chips-scroll">
                {(bootstrap?.genres || [
                  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
                  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 
                  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
                ]).map((genre) => {
                  const isSelected = (filters.genres || []).includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      className={`genre-chip ${isSelected ? 'active' : ''}`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <span className="filter-group-label">Minimum Rating</span>
              <div className="rating-chips-row">
                {[
                  { label: 'All', value: null },
                  { label: '6.0+', value: 6.0 },
                  { label: '7.0+', value: 7.0 },
                  { label: '8.0+', value: 8.0 },
                ].map((item) => {
                  const isActive = (filters.ratingMin || null) === item.value;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setFilters({ ratingMin: item.value })}
                      className={`rating-chip ${isActive ? 'active' : ''}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Release Year Range */}
            <div>
              <span className="filter-group-label">Year Range</span>
              <div className="year-inputs-row">
                <input 
                  type="number"
                  placeholder="Min"
                  value={filters.yearMin || ''}
                  onChange={(e) => setFilters({ yearMin: parseInt(e.target.value) || null })}
                  className="year-input"
                />
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>—</span>
                <input 
                  type="number"
                  placeholder="Max"
                  value={filters.yearMax || ''}
                  onChange={(e) => setFilters({ yearMax: parseInt(e.target.value) || null })}
                  className="year-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Full-Width Results Grid (Occupies Empty Space Just Like Stremio) */}
      <main>
        {results.length === 0 && !loading ? (
          <div className="search-empty-state">
            <div className="search-empty-icon">
              <Search size={30} />
            </div>
            <h3 className="search-empty-title">
              {queryParam ? `No results found for "${queryParam}"` : 'Start searching CineMatch'}
            </h3>
            <p className="search-empty-desc">
              {queryParam 
                ? 'Try checking for typos, adjusting your filters, or asking our AI search assistant.'
                : 'Search by title, director, actor, genre, or describe a theme.'}
            </p>
          </div>
        ) : (
          <div className="search-results-full-grid">
            {results.map((movie, index) => (
              <div 
                key={`${movie.id}_${index}`} 
                onClick={() => handleMovieClick(movie.id, index)}
                style={{ cursor: 'pointer', minWidth: 0, width: '100%' }}
              >
                <MovieCard 
                  movie={movie} 
                  onClick={(id) => handleMovieClick(id, index)} 
                />
              </div>
            ))}

            {/* Loading skeletons */}
            {loading && (
              <>
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
                <MovieCardSkeleton />
              </>
            )}

            {/* Infinite Scroll Sentinel */}
            {hasMore && !loading && (
              <SentinelCard onVisible={loadNextPage} />
            )}
          </div>
        )}
      </main>

    </div>
  );
};

export default SearchPage;
