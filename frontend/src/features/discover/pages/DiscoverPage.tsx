import { type FC, useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Clapperboard, 
  Bookmark, 
  Heart, 
  ChevronDown, 
  Check, 
  ExternalLink,
  Film,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  usePopularMovies, 
  useTopRatedMovies, 
  useTrendingMovies, 
  useUpcomingMovies,
  useMovieDetails,
  useMovieCredits,
  useSimilarMovies
} from '../../movies/hooks/useMovies';
import type { Movie, PaginatedMovies } from '../../movies/types/movie.types';
import { isMovieReleased } from '../../movies/utils/movie.mapper';
import { getPosterUrl, getBackdropUrl } from '../../movies/utils/image';
import { useWatchlist, useToggleWatchlist } from '../../library/hooks/useWatchlist';
import { useFavorites, useToggleFavorite } from '../../library/hooks/useFavorites';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { movieService } from '../../movies/services/movie.service';

// Category Definitions
const CATEGORY_OPTIONS = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'topRated', label: 'Top Rated' },
  { id: 'upcoming', label: 'New Releases' },
] as const;

// Media Type Options
const TYPE_OPTIONS = [
  { id: 'movie', label: 'Movie' },
  { id: 'all', label: 'All Titles' },
] as const;

// Genre Definitions with TMDB IDs
const GENRE_OPTIONS = [
  { id: 0, label: 'All Genres' },
  { id: 28, label: 'Action' },
  { id: 12, label: 'Adventure' },
  { id: 16, label: 'Animation' },
  { id: 35, label: 'Comedy' },
  { id: 80, label: 'Crime' },
  { id: 99, label: 'Documentary' },
  { id: 18, label: 'Drama' },
  { id: 10751, label: 'Family' },
  { id: 14, label: 'Fantasy' },
  { id: 36, label: 'History' },
  { id: 27, label: 'Horror' },
  { id: 10402, label: 'Music' },
  { id: 9648, label: 'Mystery' },
  { id: 10749, label: 'Romance' },
  { id: 878, label: 'Sci-Fi' },
  { id: 53, label: 'Thriller' },
  { id: 10752, label: 'War' },
  { id: 37, label: 'Western' },
];

// Reusable Glass Dropdown Component (Enlarged)
interface FilterDropdownProps<T> {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (val: T) => void;
  prefix?: string;
}

function FilterDropdown<T extends string | number>({ 
  value, 
  options, 
  onChange,
  prefix 
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '11px 22px',
          borderRadius: '24px',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
          border: isOpen ? '1.5px solid rgba(168, 85, 247, 0.65)' : '1.5px solid rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 6px 20px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }
        }}
      >
        <span>
          {prefix ? `${prefix}: ` : ''}
          {selectedOption.label}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.85 
          }} 
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            minWidth: '200px',
            maxHeight: '340px',
            overflowY: 'auto',
            backgroundColor: 'rgba(14, 14, 24, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
            zIndex: 100,
          }}
          className="custom-scrollbar"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={String(option.id)}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.22)' : 'transparent',
                  color: isSelected ? '#c084fc' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={16} style={{ color: '#c084fc' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Movie Inspector / Details Panel Component (Right Column - Enlarged & Rich)
interface MovieInspectorProps {
  movie: Movie;
  onPlayTrailer: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
}

const MovieInspector: FC<MovieInspectorProps> = ({ movie, onPlayTrailer, onSelectMovie }) => {
  const navigate = useNavigate();
  const { data: details, isLoading: isDetailsLoading } = useMovieDetails(movie.id);
  const { data: credits } = useMovieCredits(movie.id);
  const { data: similarData } = useSimilarMovies(movie.id);

  const { data: watchlist } = useWatchlist();
  const { data: favorites } = useFavorites();
  const toggleWatchlist = useToggleWatchlist();
  const toggleFavorite = useToggleFavorite();

  const isWatchlisted = watchlist?.some((w) => w.media_id === movie.id) ?? false;
  const isFavorited = favorites?.some((f) => f.media_id === movie.id) ?? false;

  // Extract top director
  const director = useMemo(() => {
    if (!credits?.crew) return null;
    return credits.crew.find((c) => c.job === 'Director')?.name || null;
  }, [credits]);

  // Extract top 4 cast members
  const topCast = useMemo(() => {
    if (!credits?.cast) return [];
    return credits.cast.slice(0, 4).map((c) => c.name);
  }, [credits]);

  // Similar movies list
  const similarMovies = useMemo(() => {
    return (similarData?.results || []).filter(isMovieReleased).slice(0, 3);
  }, [similarData]);

  // Runtime string
  const runtimeDisplay = useMemo(() => {
    const runtime = details?.runtime;
    if (!runtime) return null;
    return `${runtime} min`;
  }, [details]);

  // Year string
  const yearDisplay = useMemo(() => {
    return movie.releaseYear || (movie.releaseDate ? movie.releaseDate.slice(0, 4) : '');
  }, [movie]);

  // Genres list
  const genresList = useMemo(() => {
    if (details?.genres && details.genres.length > 0) {
      return details.genres.map((g) => g.name);
    }
    return (movie.genreIds || [])
      .map((gid) => GENRE_OPTIONS.find((g) => g.id === gid)?.label)
      .filter((n): n is string => Boolean(n) && n !== 'All Genres');
  }, [details, movie]);

  const ratingFormatted = movie.voteAverage ? movie.voteAverage.toFixed(1) : '7.5';

  return (
    <div
      style={{
        backgroundColor: 'rgba(12, 12, 20, 0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1.5px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '26px',
        overflow: 'hidden',
        boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Backdrop Header with Vignette Gradient & Centered Stylized Title */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '230px',
          backgroundImage: `url(${getBackdropUrl(movie.backdropPath || movie.posterPath, 'w780')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '24px 20px',
          textAlign: 'center',
        }}
      >
        {/* Cinematic Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(12, 12, 20, 0.25) 0%, rgba(12, 12, 20, 0.75) 65%, rgba(12, 12, 20, 0.98) 100%)',
          }}
        />

        {/* Title in stylized letter-spaced typography */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '100%' }}>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: '#ffffff',
              margin: 0,
              textShadow: '0 3px 16px rgba(0, 0, 0, 0.9)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.25
            }}
          >
            {movie.title}
          </h2>
          {details?.tagline && (
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.75)',
                margin: '6px 0 0 0',
                fontStyle: 'italic',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              "{details.tagline}"
            </p>
          )}
        </div>
      </div>

      {/* Main Body Details */}
      <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Metadata Row: Year, Runtime, Rating Badge, Language */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {yearDisplay && (
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
              {yearDisplay}
            </span>
          )}

          {runtimeDisplay ? (
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)' }}>
              {runtimeDisplay}
            </span>
          ) : isDetailsLoading ? (
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.3)' }}>...</span>
          ) : null}

          {/* Rating Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(245, 197, 24, 0.15)',
              border: '1px solid rgba(245, 197, 24, 0.35)',
              padding: '4px 10px',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#f5c518' }}>
              {ratingFormatted}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                backgroundColor: '#f5c518',
                color: '#000000',
                padding: '1px 4px',
                borderRadius: '3px',
                letterSpacing: '0.5px',
              }}
            >
              TMDB
            </span>
          </div>
        </div>

        {/* Synopsis / Overview */}
        <div>
          <p
            style={{
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.72)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {movie.overview || 'No synopsis available for this title.'}
          </p>
        </div>

        {/* GENRES Section */}
        {genresList.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'rgba(255, 255, 255, 0.45)',
                marginBottom: '10px',
              }}
            >
              GENRES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {genresList.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CAST Section */}
        {topCast.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'rgba(255, 255, 255, 0.45)',
                marginBottom: '10px',
              }}
            >
              CAST
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {topCast.map((actor) => (
                <span
                  key={actor}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {actor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* DIRECTOR Section */}
        {director && (
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'rgba(255, 255, 255, 0.45)',
                marginBottom: '10px',
              }}
            >
              DIRECTOR
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#e9d5ff',
                }}
              >
                {director}
              </span>
            </div>
          </div>
        )}

        {/* Action Dock: Trailer CTA, Watchlist, Favorite, Full Details */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: '4px',
          }}
        >
          {/* Quick Icon Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Clapperboard / Trailer Button */}
            <button
              onClick={() => onPlayTrailer(movie)}
              title="Watch Trailer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
                e.currentTarget.style.color = '#c084fc';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <Clapperboard size={18} />
            </button>

            {/* Watchlist Bookmark Button */}
            <button
              onClick={() => toggleWatchlist.mutate({ movieId: movie.id, isWatchlisted })}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: isWatchlisted ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: isWatchlisted ? '1px solid rgba(168, 85, 247, 0.55)' : '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isWatchlisted ? '#c084fc' : 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isWatchlisted) {
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
                  e.currentTarget.style.color = '#c084fc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isWatchlisted) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <Bookmark size={18} fill={isWatchlisted ? '#c084fc' : 'none'} />
            </button>

            {/* Favorite Heart Button */}
            <button
              onClick={() => toggleFavorite.mutate({ movieId: movie.id, isFavorited })}
              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: isFavorited ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: isFavorited ? '1px solid rgba(239, 68, 68, 0.55)' : '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFavorited ? '#ef4444' : 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isFavorited) {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)';
                  e.currentTarget.style.color = '#ef4444';
                }
              }}
              onMouseLeave={(e) => {
                if (!isFavorited) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
            </button>

            {/* View Details Link */}
            <button
              onClick={() => navigate(`/movie/${movie.id}`)}
              title="Full Movie Details"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <ExternalLink size={17} />
            </button>
          </div>

          {/* Primary Show / Trailer CTA */}
          <button
            onClick={() => onPlayTrailer(movie)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(168, 85, 247, 0.45)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(168, 85, 247, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(168, 85, 247, 0.45)';
            }}
          >
            <Play size={16} fill="#ffffff" />
            <span>Show</span>
          </button>
        </div>

        {/* MORE LIKE THIS (Covers blank space on the right bottom) */}
        {similarMovies.length > 0 && (
          <div style={{ paddingTop: '8px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'rgba(255, 255, 255, 0.45)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={13} color="#c084fc" />
              <span>More Like This</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {similarMovies.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => onSelectMovie && onSelectMovie(sim)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    borderRadius: '12px',
                    padding: '5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.14)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '2/3',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#111',
                    }}
                  >
                    <img
                      src={getPosterUrl(sim.posterPath, 'w185')}
                      alt={sim.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.85)',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sim.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Film Specifications & Overview Details (Fills out bottom gracefully) */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          fontSize: '12px'
        }}>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
              Status
            </span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>
              {details?.status || 'Released'}
            </span>
          </div>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
              Original Language
            </span>
            <span style={{ color: '#ffffff', fontWeight: 600, textTransform: 'uppercase' }}>
              {details?.originalLanguage || 'en'}
            </span>
          </div>
          {details?.budget && details.budget > 0 ? (
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                Budget
              </span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>
                ${(details.budget / 1_000_000).toFixed(0)}M
              </span>
            </div>
          ) : null}
          {movie.voteCount && movie.voteCount > 0 ? (
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                Total Votes
              </span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>
                {movie.voteCount.toLocaleString()}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const DiscoverPage: FC = () => {
  // Filter States
  const [mediaType, setMediaType] = useState<'movie' | 'all'>('movie');
  const [category, setCategory] = useState<'popular' | 'trending' | 'topRated' | 'upcoming'>('popular');
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);

  // Pagination / Load More State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [extraMovies, setExtraMovies] = useState<Movie[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Selected Movie for the Right Inspector Panel
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // Trailer Modal State
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Library States for badges
  const { data: watchlist } = useWatchlist();

  // Queries for different categories
  const popularQuery = usePopularMovies(1, category === 'popular');
  const trendingQuery = useTrendingMovies(1, category === 'trending');
  const topRatedQuery = useTopRatedMovies(1, category === 'topRated');
  const upcomingQuery = useUpcomingMovies(1, category === 'upcoming');

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setExtraMovies([]);
    setHasMore(true);
  }, [category]);

  const getActiveQuery = () => {
    switch (category) {
      case 'trending': return trendingQuery;
      case 'topRated': return topRatedQuery;
      case 'upcoming': return upcomingQuery;
      default: return popularQuery;
    }
  };

  const { data, isLoading, isError } = getActiveQuery();

  // Combine initial query results with loaded extra pages and remove duplicates
  const allMovies = useMemo(() => {
    const primary = (data?.results || []).filter(isMovieReleased);
    const combined = [...primary, ...extraMovies];
    const seen = new Set<number>();
    return combined.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [data, extraMovies]);

  // Apply Genre Filter
  const filteredMovies = useMemo(() => {
    if (selectedGenreId === 0) return allMovies;
    return allMovies.filter((m) => m.genreIds && m.genreIds.includes(selectedGenreId));
  }, [allMovies, selectedGenreId]);

  // Set default selected movie once data is loaded
  useEffect(() => {
    if (filteredMovies.length > 0) {
      const exists = filteredMovies.some((m) => m.id === selectedMovieId);
      if (!exists) {
        setSelectedMovieId(filteredMovies[0].id);
      }
    }
  }, [filteredMovies, selectedMovieId]);

  const selectedMovie = useMemo(() => {
    return filteredMovies.find((m) => m.id === selectedMovieId) || filteredMovies[0] || null;
  }, [filteredMovies, selectedMovieId]);

  const handlePlayTrailer = (movie: Movie) => {
    setTrailerMovie(movie);
    setIsTrailerOpen(true);
  };

  // Load More Handler
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      let result: PaginatedMovies;
      switch (category) {
        case 'trending':
          result = await movieService.getTrending(nextPage);
          break;
        case 'topRated':
          result = await movieService.getTopRated(nextPage);
          break;
        case 'upcoming':
          result = await movieService.getUpcoming(nextPage);
          break;
        default:
          result = await movieService.getPopular(nextPage);
          break;
      }
      const newItems = (result.results || []).filter(isMovieReleased);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setExtraMovies((prev) => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        if (nextPage >= (result.totalPages || 50)) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Failed to load more movies:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: '28px 40px 80px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Filter Bar: Format, Category, Genre (Bigger & Elevated) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        {/* Dropdown 1: Type */}
        <FilterDropdown
          value={mediaType}
          options={TYPE_OPTIONS}
          onChange={(val) => setMediaType(val)}
        />

        {/* Dropdown 2: Category / Sort */}
        <FilterDropdown
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(val) => setCategory(val)}
        />

        {/* Dropdown 3: Genre */}
        <FilterDropdown
          value={selectedGenreId}
          options={GENRE_OPTIONS.map((g) => ({ id: g.id, label: g.label }))}
          onChange={(val) => setSelectedGenreId(val)}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontWeight: 500 }}>
          <span>{filteredMovies.length} titles</span>
        </div>
      </div>

      {/* Main Two-Column Layout: Grid on Left, Sticky Inspector on Right */}
      <div className="discover-page-layout">
        {/* Left Column: Movie Poster Grid (5 Columns) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading && filteredMovies.length === 0 ? (
            <div className="discover-movie-grid">
              {Array.from({ length: 15 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '2/3',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      animation: 'pulse 1.8s infinite',
                    }}
                  />
                  <div
                    style={{
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      width: '75%',
                      margin: '0 auto',
                    }}
                  />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div
              style={{
                padding: '60px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <Film size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '15px' }}>Failed to load movies. Please try again.</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div
              style={{
                padding: '60px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <Film size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '15px' }}>No movies found matching the selected genre.</p>
            </div>
          ) : (
            <>
              {/* Exactly 5 Columns Movie Grid with slightly bigger posters */}
              <div className="discover-movie-grid">
                {filteredMovies.map((movie) => {
                  const isSelected = movie.id === selectedMovie?.id;
                  const isWatchlisted = watchlist?.some((w) => w.media_id === movie.id);

                  return (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovieId(movie.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        position: 'relative',
                        userSelect: 'none',
                      }}
                    >
                      {/* Poster Card Container */}
                      <div
                        style={{
                          position: 'relative',
                          aspectRatio: '2/3',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          backgroundColor: '#111119',
                          border: isSelected
                            ? '2.5px solid #ffffff'
                            : '1px solid rgba(255, 255, 255, 0.09)',
                          boxShadow: isSelected
                            ? '0 0 0 1px rgba(255, 255, 255, 0.4), 0 16px 36px -6px rgba(168, 85, 247, 0.5)'
                            : '0 6px 18px rgba(0, 0, 0, 0.45)',
                          transform: isSelected ? 'scale(1.025)' : 'scale(1)',
                          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.38)';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <img
                          src={getPosterUrl(movie.posterPath, 'w500')}
                          alt={movie.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />

                        {/* Watchlist check badge (gold badge) */}
                        {isWatchlisted && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: '#eab308',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#000000',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                              zIndex: 2,
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Movie Title below card */}
                      <div
                        style={{
                          marginTop: '10px',
                          textAlign: 'center',
                          padding: '0 4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13.5px',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.88)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.35',
                            transition: 'color 0.2s ease',
                          }}
                        >
                          {movie.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Movies Option at Bottom */}
              {hasMore && (
                <div style={{ marginTop: '44px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '13px 36px',
                      borderRadius: '30px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1.5px solid rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: isLoadingMore ? 'wait' : 'pointer',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoadingMore) {
                        e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoadingMore) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Loading Next Titles...</span>
                      </>
                    ) : (
                      <>
                        <Clapperboard size={18} color="#c084fc" />
                        <span>Load More Movies</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Sticky Movie Inspector Panel (Enlarged 440px on desktop) */}
        {selectedMovie && (
          <aside className="discover-inspector-panel custom-scrollbar">
            <MovieInspector
              movie={selectedMovie}
              onPlayTrailer={handlePlayTrailer}
              onSelectMovie={(m) => setSelectedMovieId(m.id)}
            />
          </aside>
        )}
      </div>

      {/* Trailer Modal (Instant Video Playback) */}
      {trailerMovie && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => {
            setIsTrailerOpen(false);
            setTrailerMovie(null);
          }}
          movieId={trailerMovie.id}
          movieTitle={trailerMovie.title}
        />
      )}
    </div>
  );
};
