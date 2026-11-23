import type { FC } from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  ChevronDown, 
  Check, 
  Play, 
  Trash2, 
  Info, 
  Film, 
  Bookmark, 
  X,
  Sparkles,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';

import { useWatchlist, useToggleWatchlist } from '../hooks/useWatchlist';
import { useWatchedMovies } from '../hooks/useWatchedMovies';
import { movieKeys, libraryKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../../movies/services/movie.service';
import { getPosterUrl } from '../../movies/utils/image';
import { IMAGE_SIZES } from '../../movies/constants/images';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import type { Movie } from '../../movies/types/movie.types';

import './WatchlistPage.css';

type SortFilterTab = 'last-watched' | 'a-z' | 'z-a' | 'most-watched' | 'watched' | 'not-watched';
type TypeDropdownFilter = 'all' | 'movies' | 'top-rated';

// Popular classic starter IDs if user wishes to test with 1-click sample
const SAMPLE_STARTER_IDS = [
  24,     // Kill Bill: Vol. 1
  2105,   // American Pie
  57800,  // Project X
  13,     // Forrest Gump
  522627, // The Gentlemen
  18785,  // The Hangover
  263115, // The Hangover Part II
  8363,   // Superbad
  64688,  // 21 Jump Street
  27205,  // Inception
  155,    // The Dark Knight
  550,    // Fight Club
  680,    // Pulp Fiction
  157336, // Interstellar
  299534, // Avengers: Endgame
  120     // The Lord of the Rings: Fellowship of the Ring
];

export const WatchlistPage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const toggleWatchlistMutation = useToggleWatchlist();
  const { isWatched, getProgress, toggleWatched, watchedMap } = useWatchedMovies();

  // State
  const [activeTab, setActiveTab] = useState<SortFilterTab>('last-watched');
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

  const movieIds = useMemo(() => watchlist?.map(entry => entry.media_id) || [], [watchlist]);

  // Fetch movie details for all watchlist entries
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

  // Filter and Sort Logic matching reference
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

    // 3. Pill Tab Filter & Sort
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
      case 'most-watched':
        result.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        break;
      case 'last-watched':
      default:
        // Prioritize watched movies by timestamp, then order by watchlist entry index
        result.sort((a, b) => {
          const aMeta = watchedMap[a.id];
          const bMeta = watchedMap[b.id];
          if (aMeta?.watched && bMeta?.watched) {
            return (bMeta.watchedAt || 0) - (aMeta.watchedAt || 0);
          }
          if (aMeta?.watched) return -1;
          if (bMeta?.watched) return 1;
          
          const indexA = movieIds.indexOf(a.id);
          const indexB = movieIds.indexOf(b.id);
          return indexA - indexB;
        });
        break;
    }

    return result;
  }, [movies, searchQuery, dropdownFilter, activeTab, isWatched, watchedMap, movieIds]);

  const watchedCount = useMemo(() => {
    return movies.filter(m => isWatched(m.id)).length;
  }, [movies, isWatched]);

  // Quick Action: Preload sample movies for testing
  const handlePreloadSampleWatchlist = async () => {
    toast.promise(
      (async () => {
        for (const id of SAMPLE_STARTER_IDS) {
          if (!movieIds.includes(id)) {
            await toggleWatchlistMutation.mutateAsync({ movieId: id, isWatchlisted: false });
          }
        }
        // Mark first 8 as watched with realistic progress
        const starterWatchedMap: Record<number, any> = {};
        SAMPLE_STARTER_IDS.slice(0, 8).forEach((id, idx) => {
          starterWatchedMap[id] = {
            watched: true,
            progress: idx === 0 ? 95 : idx === 1 ? 100 : idx === 2 ? 80 : 100,
            watchedAt: Date.now() - idx * 3600000,
          };
        });
        localStorage.setItem('cinematch_watched_movies_meta', JSON.stringify(starterWatchedMap));
        window.dispatchEvent(new CustomEvent('cinematch_watched_updated'));
        await queryClient.invalidateQueries({ queryKey: libraryKeys.watchlist });
      })(),
      {
        loading: 'Populating curated movie library...',
        success: 'Sample movie library loaded!',
        error: 'Failed to load sample library',
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

  const handleRemoveFromWatchlist = (e: React.MouseEvent, movieId: number, movieTitle: string) => {
    e.stopPropagation();
    toggleWatchlistMutation.mutate(
      { movieId, isWatchlisted: true },
      {
        onSuccess: () => {
          toast.success(`Removed "${movieTitle}" from watchlist`);
        },
      }
    );
  };

  if (isWatchlistLoading || (isMoviesLoading && movies.length === 0)) {
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

          {/* Filter Tab Pills */}
          <div className="watchlist-tabs">
            <button
              type="button"
              className={`watchlist-tab-pill ${activeTab === 'last-watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('last-watched')}
            >
              Last Watched
            </button>
            <button
              type="button"
              className={`watchlist-tab-pill ${activeTab === 'a-z' ? 'active' : ''}`}
              onClick={() => setActiveTab('a-z')}
            >
              A-Z
            </button>
            <button
              type="button"
              className={`watchlist-tab-pill ${activeTab === 'z-a' ? 'active' : ''}`}
              onClick={() => setActiveTab('z-a')}
            >
              Z-A
            </button>
            <button
              type="button"
              className={`watchlist-tab-pill ${activeTab === 'most-watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('most-watched')}
            >
              Most Watched
            </button>
            <button
              type="button"
              className={`watchlist-tab-pill ${activeTab === 'watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('watched')}
            >
              Watched
            </button>
            <button
              type="button"
              className={`watchlist-tab-pill ${activeTab === 'not-watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('not-watched')}
            >
              Not Watched
            </button>
          </div>
        </div>


      </div>

      {/* Main Content Area */}
      {movies.length === 0 ? (
        // Watchlist completely empty
        <div className="watchlist-empty-container">
          <div className="watchlist-empty-icon">
            <Bookmark size={32} />
          </div>
          <h2 className="watchlist-empty-title">Your Watchlist is Empty</h2>
          <p className="watchlist-empty-desc">
            Explore thousands of blockbuster films, award winners, and hidden gems to build your ultimate personal library.
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
            <button
              type="button"
              className="watchlist-secondary-cta-btn"
              onClick={handlePreloadSampleWatchlist}
            >
              <Sparkles size={16} />
              Load Sample Library
            </button>
          </div>
        </div>
      ) : processedMovies.length === 0 ? (
        // Filter returned no results
        <div className="watchlist-empty-container">
          <div className="watchlist-empty-icon">
            <Film size={32} />
          </div>
          <h2 className="watchlist-empty-title">No Matching Titles</h2>
          <p className="watchlist-empty-desc">
            No movies in your watchlist match the current filter or search query.
          </p>
          <div className="watchlist-empty-actions">
            <button
              type="button"
              className="watchlist-secondary-cta-btn"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('last-watched');
                setDropdownFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        // 8-Column Movie Poster Grid
        <div className="watchlist-grid">
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
                        title="Remove from watchlist"
                        onClick={(e) => handleRemoveFromWatchlist(e, movie.id, movie.title)}
                      >
                        <Trash2 size={13} />
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
        </div>
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
