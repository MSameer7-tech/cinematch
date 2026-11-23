import type { FC } from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  Check, 
  Play, 
  Heart, 
  Info, 
  Film, 
  X,
  Sparkles,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';

import { useFavorites, useToggleFavorite } from '../hooks/useFavorites';
import { useWatchedMovies } from '../hooks/useWatchedMovies';
import { movieKeys, libraryKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../../movies/services/movie.service';
import { getPosterUrl } from '../../movies/utils/image';
import { IMAGE_SIZES } from '../../movies/constants/images';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import type { Movie } from '../../movies/types/movie.types';

import './WatchlistPage.css';

type FavTab = 'all' | 'a-z' | 'z-a' | 'most-popular' | 'highest-rated' | 'watched' | 'not-watched';
type TypeDropdownFilter = 'all' | 'movies' | 'top-rated';

const FAVORITES_TABS: { id: FavTab; label: string }[] = [
  { id: 'all', label: 'All Favorites' },
  { id: 'a-z', label: 'A-Z' },
  { id: 'z-a', label: 'Z-A' },
  { id: 'most-popular', label: 'Most Popular' },
  { id: 'highest-rated', label: 'Highest Rated' },
  { id: 'watched', label: 'Watched' },
  { id: 'not-watched', label: 'Not Watched' },
];

// Popular classic movies for 1-click sample favorites preloading
const SAMPLE_FAVORITE_IDS = [
  155,    // The Dark Knight
  27205,  // Inception
  157336, // Interstellar
  550,    // Fight Club
  680,    // Pulp Fiction
  13,     // Forrest Gump
  24,     // Kill Bill: Vol. 1
  299534, // Avengers: Endgame
  120,    // The Lord of the Rings: Fellowship of the Ring
  8363,   // Superbad
  522627, // The Gentlemen
  64688,  // 21 Jump Street
  18785,  // The Hangover
  2105,   // American Pie
  57800,  // Project X
  263115  // The Hangover Part II
];

export const FavoritesPage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: favorites, isLoading: isFavoritesLoading } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();
  const { isWatched, getProgress, toggleWatched, watchedMap } = useWatchedMovies();

  // State
  const [activeTab, setActiveTab] = useState<FavTab>('all');
  const [dropdownFilter, setDropdownFilter] = useState<TypeDropdownFilter>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trailerMovie, setTrailerMovie] = useState<{ id: number; title: string } | null>(null);

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

  const movieIds = useMemo(() => favorites?.map(entry => entry.media_id) || [], [favorites]);

  // Fetch movie details for all favorites
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

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) || 
        (m.overview && m.overview.toLowerCase().includes(q))
      );
    }

    // 2. Dropdown Filter
    if (dropdownFilter === 'top-rated') {
      result = result.filter(m => m.voteAverage >= 7.5);
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
        result.sort((a, b) => b.voteAverage - a.voteAverage);
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
  }, [movies, searchQuery, dropdownFilter, activeTab, isWatched, movieIds]);

  const watchedCount = useMemo(() => {
    return movies.filter(m => isWatched(m.id)).length;
  }, [movies, isWatched]);

  // Quick Action: Preload sample favorites for instant preview
  const handlePreloadSampleFavorites = async () => {
    toast.promise(
      (async () => {
        for (const id of SAMPLE_FAVORITE_IDS) {
          if (!movieIds.includes(id)) {
            await toggleFavoriteMutation.mutateAsync({ movieId: id, isFavorited: false });
          }
        }
        await queryClient.invalidateQueries({ queryKey: libraryKeys.favorites });
      })(),
      {
        loading: 'Populating favorite classics...',
        success: 'Sample favorites loaded!',
        error: 'Failed to load sample favorites',
      }
    );
  };

  const handleToggleWatchedMovie = (e: React.MouseEvent, movieId: number, movieTitle: string) => {
    e.stopPropagation();
    toggleWatched(movieId);
    const currentlyWatched = isWatched(movieId);
    if (!currentlyWatched) {
      toast.success(`Marked "${movieTitle}" as watched`);
    } else {
      toast.info(`Marked "${movieTitle}" as unwatched`);
    }
  };

  const handleRemoveFromFavorites = (e: React.MouseEvent, movieId: number, movieTitle: string) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate(
      { movieId, isFavorited: true },
      {
        onSuccess: () => {
          toast.success(`Removed "${movieTitle}" from favorites`);
        },
      }
    );
  };

  if (isFavoritesLoading || (isMoviesLoading && movies.length === 0)) {
    return (
      <div className="watchlist-page-container">
        <HeroSkeleton />
      </div>
    );
  }

  const dropdownLabels: Record<TypeDropdownFilter, string> = {
    all: 'All',
    movies: 'Movies',
    'top-rated': 'Top Rated (7.5+)',
  };

  return (
    <div className="watchlist-page-container">
      {/* Top Filter and Controls Bar */}
      <div className="watchlist-header">
        <div className="watchlist-filters-group">
          {/* Dropdown Filter */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
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
                  className={`watchlist-dropdown-item ${dropdownFilter === 'top-rated' ? 'active' : ''}`}
                  onClick={() => { setDropdownFilter('top-rated'); setIsDropdownOpen(false); }}
                >
                  Top Rated (7.5+)
                  {dropdownFilter === 'top-rated' && <Check size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Filter Tab Pills with Sliding Indicator */}
          <div className="watchlist-tabs">
            {FAVORITES_TABS.map((tab) => {
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
                      layoutId="favorites-active-tab-pill"
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
        // Favorites completely empty
        <div className="watchlist-empty-container">
          <div className="watchlist-empty-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' }}>
            <Heart size={32} />
          </div>
          <h2 className="watchlist-empty-title">Your Favorites Collection is Empty</h2>
          <p className="watchlist-empty-desc">
            Save movies you love and want to revisit anytime. Build your personal cinema hall of fame.
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
          <h2 className="watchlist-empty-title">No Matching Favorites</h2>
          <p className="watchlist-empty-desc">
            No favorite movies match the current filter or search query.
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
        // 8-Column Movie Poster Grid with Smooth Tab/Filter Switch Animation
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

                  {/* Favorite Heart Badge (Top Right) */}
                  <button
                    type="button"
                    className="watchlist-fav-badge"
                    title="Favorited - Click to remove"
                    onClick={(e) => handleRemoveFromFavorites(e, movie.id, movie.title)}
                  >
                    <Heart size={12} fill="#ffffff" strokeWidth={0} />
                  </button>

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
                        className="watchlist-icon-btn danger"
                        title="Remove from favorites"
                        onClick={(e) => handleRemoveFromFavorites(e, movie.id, movie.title)}
                      >
                        <Heart size={13} fill="#ef4444" color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Title & Year Below Poster */}
                <div className="watchlist-card-info">
                  <h3 className="watchlist-card-title" title={movie.title}>
                    {movie.title}
                  </h3>
                  <div className="watchlist-card-subtitle">
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                    {movie.voteAverage > 0 && (
                      <span>★ {movie.voteAverage.toFixed(1)}</span>
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
    </div>
  );
};
