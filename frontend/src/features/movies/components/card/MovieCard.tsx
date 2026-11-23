import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Heart, Star } from 'lucide-react';
import type { Movie } from '../../types/movie.types';
import { getPosterUrl } from '../../utils/image';
import { useWatchlist, useToggleWatchlist } from '../../../library/hooks/useWatchlist';
import { useFavorites, useToggleFavorite } from '../../../library/hooks/useFavorites';
import { useRatings } from '../../../library/hooks/useRatings';
import { RatingDialog } from '../../../library/components/RatingDialog';
import { TrailerModal } from '../details/TrailerModal';
import { toast } from 'sonner';

interface MovieCardProps {
  movie: Movie & { score?: number; reasons?: string[]; progress?: number };
  onClick?: (id: number) => void;
}

export const MovieCard: FC<MovieCardProps> = ({ movie, onClick }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Watchlist hook
  const { data: watchlist } = useWatchlist();
  const toggleWatchlistMutation = useToggleWatchlist();
  const inWatchlist = watchlist?.some((entry) => entry.media_id === movie.id) ?? false;

  // Favorites hook
  const { data: favorites } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();
  const isFavorited = favorites?.some((entry) => entry.media_id === movie.id) ?? false;

  // Ratings hook
  const { data: userRatings } = useRatings();
  const userRating = userRatings?.find((entry) => entry.media_id === movie.id)?.rating;

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlistMutation.mutate(
      { movieId: movie.id, isWatchlisted: inWatchlist },
      {
        onSuccess: () => {
          if (inWatchlist) {
            toast.success(`Removed "${movie.title}" from Watchlist`);
          } else {
            toast.success(`Added "${movie.title}" to Watchlist`);
          }
        },
      }
    );
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate(
      { movieId: movie.id, isFavorited },
      {
        onSuccess: () => {
          if (isFavorited) {
            toast.success(`Removed "${movie.title}" from Favorites`);
          } else {
            toast.success(`Added "${movie.title}" to Favorites`);
          }
        },
      }
    );
  };

  const handleOpenRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRatingOpen(true);
  };

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrailerOpen(true);
  };

  return (
    <>
      <motion.div
        className="movie-card-container"
        style={{
          position: 'relative',
          width: '100%',
          minWidth: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          cursor: 'pointer',
        }}
        whileHover="hover"
        initial="initial"
        variants={{
          hover: {
            scale: 1.03,
            transition: { duration: 0.22, ease: 'easeOut' },
          },
        }}
        onClick={() => onClick?.(movie.id)}
      >
        {/* Poster Image Box */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '2/3',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Match Percentage Badge if available */}
          {movie.score !== undefined && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(10, 10, 18, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#c084fc',
                zIndex: 10,
              }}
            >
              {Math.min(100, Math.max(1, movie.score > 1 ? Math.round(movie.score) : Math.round(movie.score * 100)))}% Match
            </div>
          )}

          {/* Action Icons at Top-Right on Hover Only */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: -4 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 20,
            }}
          >
            {/* Add to Watchlist Button */}
            <button
              onClick={handleToggleWatchlist}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label="Watchlist"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: inWatchlist ? 'rgba(124, 58, 237, 0.4)' : 'rgba(15, 15, 25, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: inWatchlist ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: inWatchlist ? '#A78BFA' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                boxShadow: 'none',
                transition: 'background-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {inWatchlist ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              aria-label="Favorite"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isFavorited ? 'rgba(239, 68, 68, 0.35)' : 'rgba(15, 15, 25, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isFavorited ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: isFavorited ? '#ef4444' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                boxShadow: 'none',
                transition: 'background-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Heart size={15} fill={isFavorited ? '#ef4444' : 'none'} strokeWidth={2} />
            </button>

            {/* Rate Movie Button */}
            <button
              onClick={handleOpenRate}
              title={userRating ? `Your Rating: ${userRating}/10` : 'Rate Movie'}
              aria-label="Rate"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: userRating ? 'rgba(245, 197, 24, 0.3)' : 'rgba(15, 15, 25, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: userRating ? '1px solid rgba(245, 197, 24, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: userRating ? '#F5C518' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                boxShadow: 'none',
                transition: 'background-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Star size={15} fill={userRating ? '#F5C518' : 'none'} strokeWidth={userRating ? 1 : 2} />
            </button>
          </motion.div>

          {/* Poster Image */}
          <img
            src={getPosterUrl(movie.posterPath)}
            alt={movie.title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Dark Overlay on Hover for Contrast */}
          <motion.div
            variants={{
              initial: { opacity: 0 },
              hover: { opacity: 1 },
            }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(7, 7, 13, 0.35)',
              pointerEvents: 'none',
            }}
          />

          {/* Centered Circular Glass Play Button Overlay (Visible on Hover Only, No Glow) */}
          <motion.div
            variants={{
              initial: { opacity: 0, scale: 0.85 },
              hover: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15,
            }}
          >
            <button
              onClick={handlePlayTrailer}
              title="Watch Trailer"
              aria-label="Watch Trailer"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 15, 25, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.15s, background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.85)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 15, 25, 0.75)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Play size={20} fill="currentColor" style={{ marginLeft: '3px' }} />
            </button>
          </motion.div>
        </div>

        {/* Clean Movie Title Underneath */}
        <div style={{ textAlign: 'center', padding: '0 4px' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '0.2px',
            }}
            title={movie.title}
          >
            {movie.title}
          </h4>
        </div>
      </motion.div>

      {/* Embedded Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movieId={movie.id}
        movieTitle={movie.title}
      />

      {/* Embedded Rating Dialog */}
      <RatingDialog
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        movieId={movie.id}
        movieTitle={movie.title}
      />
    </>
  );
};
