import type { FC } from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Check, 
  Play, 
  Star, 
  Info, 
  Film, 
  Compass 
} from 'lucide-react';
import { toast } from 'sonner';

import { useRatings } from '../hooks/useRatings';
import { useWatchedMovies } from '../hooks/useWatchedMovies';
import { movieKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../../movies/services/movie.service';
import { getPosterUrl } from '../../movies/utils/image';
import { IMAGE_SIZES } from '../../movies/constants/images';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { RatingDialog } from '../components/RatingDialog';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import type { Movie } from '../../movies/types/movie.types';

import './WatchlistPage.css';

type RatingTab = 'all' | 'a-z' | 'z-a' | 'most-popular' | 'highest-rated' | 'lowest-rated' | 'watched' | 'not-watched';
type TypeDropdownFilter = 'all' | 'movies' | 'masterpieces' | 'high-rated';

const RATINGS_TABS: { id: RatingTab; label: string }[] = [
  { id: 'all', label: 'All Rated' },
  { id: 'a-z', label: 'A-Z' },
  { id: 'z-a', label: 'Z-A' },
  { id: 'most-popular', label: 'Most Popular' },
  { id: 'highest-rated', label: 'Highest Rated' },
  { id: 'lowest-rated', label: 'Lowest Rated' },
  { id: 'watched', label: 'Watched' },
  { id: 'not-watched', label: 'Not Watched' },
];

const dropdownLabels: Record<TypeDropdownFilter, string> = {
  all: 'All',
  movies: 'Movies',
  masterpieces: 'Masterpieces (9-10)',
  'high-rated': 'High Scores (7+)',
};

export const RatingsPage: FC = () => {
  const navigate = useNavigate();
  const { data: ratings, isLoading: isRatingsLoading } = useRatings();
  const { isWatched, getProgress, toggleWatched } = useWatchedMovies();

  // State
  const [activeTab, setActiveTab] = useState<RatingTab>('all');
  const [dropdownFilter, setDropdownFilter] = useState<TypeDropdownFilter>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trailerMovie, setTrailerMovie] = useState<{ id: number; title: string } | null>(null);
  const [ratingMovie, setRatingMovie] = useState<{ id: number; title: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const movieIds = useMemo(() => ratings?.map(entry => entry.media_id) || [], [ratings]);
  const ratingMap = useMemo(() => {
    const map = new Map<number, number>();
    ratings?.forEach(r => map.set(r.media_id, r.rating));
    return map;
  }, [ratings]);

  // Fetch movie details for all rated titles
  const queries = useQueries({
    queries: movieIds.map((id) => ({
      queryKey: movieKeys.detail(id),
      queryFn: () => movieService.getMovie(id),
      staleTime: 1000 * 60 * 30,
    })),
  });

  const isMoviesLoading = queries.some(q => q.isLoading);
  const movies = useMemo(() => {
    return queries
      .map(q => q.data)
      .filter((movie): movie is Movie => movie !== undefined);
  }, [queries]);

  // Filter and Sort Logic
  const processedMovies = useMemo(() => {
    let result = [...movies];

    // 1. Text Search Filter (if any)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) || 
        (m.overview && m.overview.toLowerCase().includes(q))
      );
    }

    // 2. Dropdown Filter
    if (dropdownFilter === 'masterpieces') {
      result = result.filter(m => (ratingMap.get(m.id) || 0) >= 9);
    } else if (dropdownFilter === 'high-rated') {
      result = result.filter(m => (ratingMap.get(m.id) || 0) >= 7);
    }

    // 3. Tab Filter & Sort
    switch (activeTab) {
      case 'watched':
        result = result.filter(m => isWatched(m.id));
        break;
      case 'not-watched':
        result = result.filter(m => !isWatched(m.id));
        break;
      case 'a-z':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'most-popular':
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'highest-rated':
        result.sort((a, b) => (ratingMap.get(b.id) || 0) - (ratingMap.get(a.id) || 0));
        break;
      case 'lowest-rated':
        result.sort((a, b) => (ratingMap.get(a.id) || 0) - (ratingMap.get(b.id) || 0));
        break;
      case 'all':
      default:
        result.sort((a, b) => {
          const indexA = movieIds.indexOf(a.id);
          const indexB = movieIds.indexOf(b.id);
          return indexA - indexB;
        });
        break;
    }

    return result;
  }, [movies, searchQuery, dropdownFilter, activeTab, isWatched, ratingMap, movieIds]);

  const handleToggleWatchedMovie = (e: React.MouseEvent, movieId: number, title: string) => {
    e.stopPropagation();
    toggleWatched(movieId);
    const nowWatched = !isWatched(movieId);
    toast.success(nowWatched ? `Marked "${title}" as watched` : `Marked "${title}" as unwatched`);
  };

  if (isRatingsLoading || (isMoviesLoading && movies.length === 0 && movieIds.length > 0)) {
    return <HeroSkeleton />;
  }

  return (
    <div className="watchlist-page-container">
      {/* Header with Controls & Filter Tabs */}
      <div className="watchlist-header">
        <div className="watchlist-filters-group">
          {/* Dropdown Filter */}
          <div className="watchlist-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="watchlist-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{dropdownLabels[dropdownFilter]}</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {isDropdownOpen && (
              <div className="watchlist-dropdown-menu">
                <button
                  type="button"
                  className={`watchlist-dropdown-item ${dropdownFilter === 'all' ? 'active' : ''}`}
                  onClick={() => { setDropdownFilter('all'); setIsDropdownOpen(false); }}
                >
                  All Titles
                  {dropdownFilter === 'all' && <Check size={14} />}
                </button>
                <button
                  type="button"
                  className={`watchlist-dropdown-item ${dropdownFilter === 'movies' ? 'active' : ''}`}
                  onClick={() => { setDropdownFilter('movies'); setIsDropdownOpen(false); }}
                >
                  Movies
                  {dropdownFilter === 'movies' && <Check size={14} />}
                </button>
                <button
                  type="button"
                  className={`watchlist-dropdown-item ${dropdownFilter === 'masterpieces' ? 'active' : ''}`}
                  onClick={() => { setDropdownFilter('masterpieces'); setIsDropdownOpen(false); }}
                >
                  Masterpieces (9-10)
                  {dropdownFilter === 'masterpieces' && <Check size={14} />}
                </button>
                <button
                  type="button"
                  className={`watchlist-dropdown-item ${dropdownFilter === 'high-rated' ? 'active' : ''}`}
                  onClick={() => { setDropdownFilter('high-rated'); setIsDropdownOpen(false); }}
                >
                  High Scores (7+)
                  {dropdownFilter === 'high-rated' && <Check size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Filter Tab Pills with Sliding Indicator */}
          <div className="watchlist-tabs">
            {RATINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`watchlist-tab-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ position: 'relative' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="ratings-active-tab-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                        zIndex: 0,
                      }}
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {movies.length === 0 ? (
        // Ratings completely empty
        <div className="watchlist-empty-container">
          <div 
            className="watchlist-empty-icon" 
            style={{ 
              background: 'rgba(245, 197, 24, 0.12)', 
              borderColor: 'rgba(245, 197, 24, 0.25)', 
              color: '#F5C518' 
            }}
          >
            <Star size={32} fill="#F5C518" />
          </div>
          <h2 className="watchlist-empty-title">Your Ratings Collection is Empty</h2>
          <p className="watchlist-empty-desc">
            Rate movies you have watched to refine your taste profile and get hyper-personalized recommendations.
          </p>
          <div className="watchlist-empty-actions">
            <button
              type="button"
              className="watchlist-cta-btn"
              onClick={() => navigate('/discover')}
            >
              <Compass size={16} />
              Explore Movies
            </button>
          </div>
        </div>
      ) : processedMovies.length === 0 ? (
        // Filter returned no results
        <div className="watchlist-empty-container">
          <div className="watchlist-empty-icon">
            <Film size={32} />
          </div>
          <h2 className="watchlist-empty-title">No Matching Rated Movies</h2>
          <p className="watchlist-empty-desc">
            No rated movies match the current filter or search criteria.
          </p>
          <div className="watchlist-empty-actions">
            <button
              type="button"
              className="watchlist-secondary-cta-btn"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
                setDropdownFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        // Responsive Movie Poster Grid with Smooth Tab/Filter Switch Animation
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${dropdownFilter}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="watchlist-grid"
          >
            {processedMovies.map((movie) => {
              const watched = isWatched(movie.id);
              const progress = getProgress(movie.id);
              const posterSrc = getPosterUrl(movie.posterPath, IMAGE_SIZES.POSTER.MEDIUM);
              const userRating = ratingMap.get(movie.id);

              return (
                <div key={movie.id} className="watchlist-card-wrapper">
                  <div
                    className="watchlist-poster-card"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    {/* Poster Image */}
                    <img
                      src={posterSrc}
                      alt={movie.title}
                      className="watchlist-poster-img"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Watched Badge (Circular Checkmark in Top Left) */}
                    {watched ? (
                      <button
                        type="button"
                        className="watchlist-watched-badge"
                        title="Watched - Click to toggle"
                        onClick={(e) => handleToggleWatchedMovie(e, movie.id, movie.title)}
                      >
                        <Check size={12} strokeWidth={3.5} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="watchlist-unwatched-badge"
                        title="Mark as watched"
                        onClick={(e) => handleToggleWatchedMovie(e, movie.id, movie.title)}
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    )}

                    {/* User Rating Badge (Top Right) */}
                    {userRating !== undefined && (
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 10,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: 'rgba(15, 16, 26, 0.88)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(245, 197, 24, 0.4)',
                          color: '#F5C518',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          outline: 'none',
                        }}
                        title={`Your Rating: ${userRating}/10 (Click to edit)`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingMovie({ id: movie.id, title: movie.title });
                        }}
                      >
                        <Star size={11} fill="#F5C518" />
                        <span>{userRating}</span>
                      </button>
                    )}

                    {/* Watch Progress Bar */}
                    {(watched || progress > 0) && (
                      <div className="watchlist-progress-track">
                        <div
                          className="watchlist-progress-fill"
                          style={{ width: `${progress > 0 ? progress : 100}%` }}
                        />
                      </div>
                    )}

                    {/* Hover Overlay with Action Buttons */}
                    <div className="watchlist-card-overlay">
                      <button
                        type="button"
                        className="watchlist-overlay-btn watchlist-trailer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrailerMovie({ id: movie.id, title: movie.title });
                        }}
                      >
                        <Play size={12} fill="currentColor" />
                        Show
                      </button>

                      <div className="watchlist-action-row">
                        <button
                          type="button"
                          className="watchlist-icon-btn"
                          title={watched ? "Mark as unwatched" : "Mark as watched"}
                          onClick={(e) => handleToggleWatchedMovie(e, movie.id, movie.title)}
                        >
                          <Check size={13} style={{ color: watched ? '#eab308' : 'inherit' }} />
                        </button>

                        <button
                          type="button"
                          className="watchlist-icon-btn"
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/movie/${movie.id}`);
                          }}
                        >
                          <Info size={13} />
                        </button>

                        <button
                          type="button"
                          className="watchlist-icon-btn"
                          title="Edit your rating"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRatingMovie({ id: movie.id, title: movie.title });
                          }}
                        >
                          <Star size={13} fill="#F5C518" color="#F5C518" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Title & Info Below Poster */}
                  <div className="watchlist-card-info">
                    <h3 className="watchlist-card-title" title={movie.title}>
                      {movie.title}
                    </h3>
                    <div className="watchlist-card-subtitle">
                      {movie.releaseYear && <span>{movie.releaseYear}</span>}
                      {userRating !== undefined && (
                        <span style={{ color: '#F5C518', fontWeight: 600 }}>
                          ★ {userRating}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          isOpen={!!trailerMovie}
          onClose={() => setTrailerMovie(null)}
          movieId={trailerMovie.id}
          movieTitle={trailerMovie.title}
        />
      )}

      {/* Edit Rating Dialog */}
      {ratingMovie && (
        <RatingDialog
          isOpen={!!ratingMovie}
          onClose={() => setRatingMovie(null)}
          movieId={ratingMovie.id}
          movieTitle={ratingMovie.title}
        />
      )}
    </div>
  );
};
