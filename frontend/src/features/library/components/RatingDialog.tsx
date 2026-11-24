import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trash2 } from 'lucide-react';
import { useRatings, useRateMovie, useDeleteRating } from '../hooks/useRatings';
import { useMovieDetails } from '../../movies/hooks/useMovies';
import { getPosterUrl } from '../../movies/utils/image';

interface RatingDialogProps {
  movieId: number;
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  posterPath?: string | null;
  releaseYear?: string;
  voteAverage?: number;
  runtime?: number | null;
  genres?: { id: number; name: string }[] | string[];
  overview?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing',
  2: 'Poor',
  3: 'Weak',
  4: 'Below Average',
  5: 'Average',
  6: 'Decent',
  7: 'Good',
  8: 'Great',
  9: 'Excellent',
  10: 'Masterpiece',
};

export const RatingDialog: FC<RatingDialogProps> = ({ 
  movieId, 
  isOpen, 
  onClose, 
  movieTitle,
  posterPath: propPoster,
  releaseYear: propYear,
  voteAverage: propVoteAverage,
  runtime: propRuntime,
  genres: propGenres,
  overview: propOverview,
}) => {
  const { data: ratings } = useRatings();
  const rateMutation = useRateMovie();
  const deleteMutation = useDeleteRating();

  // Fetch full movie details to display rich context
  const { data: movieDetails } = useMovieDetails(movieId);

  const existingRating = ratings?.find(entry => entry.media_id === movieId)?.rating;
  const [selectedRating, setSelectedRating] = useState<number | null>(existingRating || null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Sync state whenever the dialog opens or existing rating updates
  useEffect(() => {
    if (isOpen) {
      setSelectedRating(existingRating || null);
      setHoveredRating(null);
    }
  }, [isOpen, existingRating]);

  const activeNumber = hoveredRating ?? selectedRating;

  // Resolve display data with fallbacks
  const title = movieDetails?.title || movieTitle;
  const posterPath = movieDetails?.posterPath ?? propPoster;
  const posterSrc = getPosterUrl(posterPath, 'w342');
  const releaseYear = movieDetails?.releaseYear || (movieDetails?.releaseDate ? movieDetails.releaseDate.slice(0, 4) : propYear);
  const voteAverage = movieDetails?.voteAverage ?? propVoteAverage;
  const runtime = movieDetails?.runtime ?? propRuntime;
  const rawGenres = movieDetails?.genres || propGenres;
  const overview = movieDetails?.tagline || movieDetails?.overview || propOverview;

  const genresList: string[] = Array.isArray(rawGenres)
    ? rawGenres.map(g => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  const formatRuntime = (mins?: number | null) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleSave = () => {
    if (selectedRating !== null) {
      rateMutation.mutate({ movieId, rating: selectedRating }, {
        onSuccess: () => onClose()
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(movieId, {
      onSuccess: () => {
        setSelectedRating(null);
        onClose();
      }
    });
  };

  const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(5, 6, 12, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '1.25rem',
        }}>
          {/* Backdrop click closes modal */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '510px',
              backgroundColor: '#0f1017',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '24px 26px',
              color: '#ffffff',
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 2px 8px rgba(0, 0, 0, 0.4)',
              zIndex: 10000,
              boxSizing: 'border-box',
            }}
          >
            {/* Top Bar: Title & Close Button */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(245, 197, 24, 0.12)',
                  border: '1px solid rgba(245, 197, 24, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F5C518',
                  flexShrink: 0,
                }}>
                  <Star size={17} fill="#F5C518" />
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '-0.2px',
                    color: '#ffffff',
                  }}>
                    Rate Movie
                  </h3>
                  <span style={{
                    fontSize: '12.5px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    Your rating personalizes your recommendations
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Movie Info Card Preview */}
            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '14px',
              marginBottom: '20px',
              alignItems: 'center',
            }}>
              {/* Poster Thumbnail */}
              <div style={{
                width: '54px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#161722',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <img
                  src={posterSrc}
                  alt={title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Movie Details Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  margin: '0 0 5px 0',
                  fontSize: '16.5px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {title}
                </h4>

                {/* Metadata Row: Year • Runtime • TMDB • Genres */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '6px',
                  fontSize: '12.5px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  marginBottom: overview ? '4px' : '0',
                }}>
                  {releaseYear && (
                    <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)' }}>
                      {releaseYear}
                    </span>
                  )}
                  {runtime && (
                    <>
                      <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                      <span>{formatRuntime(runtime)}</span>
                    </>
                  )}
                  {typeof voteAverage === 'number' && voteAverage > 0 && (
                    <>
                      <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 700,
                        color: '#F5C518',
                      }}>
                        <Star size={11} fill="#F5C518" />
                        {voteAverage.toFixed(1)}
                      </span>
                    </>
                  )}
                  {genresList.length > 0 && (
                    <>
                      <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {genresList.slice(0, 2).join(', ')}
                      </span>
                    </>
                  )}
                </div>

                {/* Tagline / Overview snippet */}
                {overview && (
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: 1.35,
                    color: 'rgba(255, 255, 255, 0.45)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {overview}
                  </p>
                )}
              </div>
            </div>

            {/* Rating Feedback Indicator */}
            <div style={{ 
              minHeight: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              {activeNumber ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  background: 'rgba(245, 197, 24, 0.12)',
                  border: '1px solid rgba(245, 197, 24, 0.3)',
                  color: '#F5C518',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '-0.1px',
                }}>
                  <Star size={13} fill="#F5C518" />
                  <span>{activeNumber}/10 • {RATING_LABELS[activeNumber]}</span>
                </div>
              ) : (
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  Select a score from 1 to 10
                </span>
              )}
            </div>

            {/* 1 - 10 Scale Container */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '5px',
                marginBottom: '24px',
              }}
              onMouseLeave={() => setHoveredRating(null)}
            >
              {scale.map((num) => {
                const isSelected = selectedRating === num;
                const isHovered = hoveredRating !== null && num <= hoveredRating;
                const isActive = selectedRating !== null && hoveredRating === null && num <= selectedRating;

                let bgColor = 'rgba(255, 255, 255, 0.04)';
                let textColor = 'rgba(255, 255, 255, 0.65)';
                let borderColor = 'rgba(255, 255, 255, 0.08)';

                if (isSelected) {
                  bgColor = '#F5C518';
                  textColor = '#0a0a10';
                  borderColor = '#F5C518';
                } else if (isHovered || isActive) {
                  bgColor = 'rgba(245, 197, 24, 0.14)';
                  textColor = '#F5C518';
                  borderColor = 'rgba(245, 197, 24, 0.35)';
                }

                return (
                  <button
                    key={num}
                    type="button"
                    onMouseEnter={() => setHoveredRating(num)}
                    onClick={() => setSelectedRating(num)}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '8px',
                      background: bgColor,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: isSelected ? 800 : 600,
                      transition: 'all 0.12s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                      userSelect: 'none',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              {existingRating && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  style={{
                    marginRight: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'all 0.18s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.16)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'; }}
                >
                  <Trash2 size={13} />
                  <span>{deleteMutation.isPending ? 'Removing...' : 'Remove Rating'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  transition: 'all 0.18s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={selectedRating === null || rateMutation.isPending}
                style={{
                  padding: '9px 22px',
                  background: selectedRating !== null 
                    ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  color: selectedRating !== null ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                  border: selectedRating !== null ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  cursor: selectedRating === null || rateMutation.isPending ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  transition: 'all 0.18s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (selectedRating !== null && !rateMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {rateMutation.isPending ? 'Saving...' : existingRating ? 'Update Rating' : 'Save Rating'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
