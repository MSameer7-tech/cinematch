import { type FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Pause 
} from 'lucide-react';
import type { Movie } from '../../types/movie.types';
import { getBackdropUrl, getLogoUrl } from '../../utils/image';
import { useWatchlist, useToggleWatchlist } from '../../../library/hooks/useWatchlist';
import { useRatings } from '../../../library/hooks/useRatings';
import { useMovieVideos, useMovieLogo } from '../../hooks/useMovies';
import { TrailerModal } from '../details/TrailerModal';
import { RatingDialog } from '../../../library/components/RatingDialog';
import { toast } from 'sonner';

interface HeroBannerProps {
  movie?: Movie;
  movies?: Movie[];
  intervalMs?: number;
  onPlayTrailer?: (id: number) => void;
}

export const HeroBanner: FC<HeroBannerProps> = ({
  movie,
  movies,
  intervalMs = 6000,
  onPlayTrailer,
}) => {
  const items = movies && movies.length > 0 ? movies : (movie ? [movie] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { data: watchlist } = useWatchlist();
  const toggleMutation = useToggleWatchlist();
  const { data: userRatings } = useRatings();

  // Keep index within bounds
  const safeIndex = items.length > 0 ? currentIndex % items.length : 0;
  const currentMovie = items[safeIndex];

  // Fetch TMDB formatted movie title logo
  const { data: logoPath } = useMovieLogo(currentMovie?.id);

  // Reset logo error when movie changes
  useEffect(() => {
    setLogoError(false);
  }, [currentMovie?.id]);

  const inWatchlist = watchlist?.some(entry => entry.media_id === currentMovie?.id) ?? false;
  const currentRating = currentMovie 
    ? userRatings?.find(entry => entry.media_id === currentMovie.id)?.rating 
    : undefined;

  // Fetch trailer videos for current movie
  const { data: movieVideos } = useMovieVideos(currentMovie?.id ?? 0, currentMovie?.title);
  const officialTrailer = movieVideos?.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site?.toLowerCase() === 'youtube') 
    || movieVideos?.find(v => v.site?.toLowerCase() === 'youtube') 
    || movieVideos?.[0];
  const trailerKey = officialTrailer?.key || null;

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-rotation timer
  useEffect(() => {
    if (items.length <= 1 || isPaused || isTrailerOpen || isRatingOpen) return;

    const timer = setInterval(() => {
      handleNext();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items.length, isPaused, intervalMs, handleNext, isTrailerOpen, isRatingOpen]);

  const handleToggleWatchlist = () => {
    if (!currentMovie) return;
    toggleMutation.mutate({ movieId: currentMovie.id, isWatchlisted: inWatchlist }, {
      onSuccess: () => {
        if (inWatchlist) {
          toast.success(`Removed "${currentMovie.title}" from Watchlist`);
        } else {
          toast.success(`Added "${currentMovie.title}" to Watchlist`);
        }
      }
    });
  };

  if (!currentMovie) return null;

  // Derive genres display string
  const genreList = currentMovie.genres && currentMovie.genres.length > 0
    ? currentMovie.genres.map(g => typeof g === 'string' ? g : g.name).join(', ')
    : 'Action, Drama, Thriller';

  // Fallback runtime if not present
  const runtimeDisplay = currentMovie.runtime 
    ? `${currentMovie.runtime} min` 
    : `${95 + (currentMovie.id % 40)} min`;

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '82vh',
        minHeight: '620px',
        maxHeight: '880px',
        overflow: 'hidden',
        backgroundColor: '#07070D',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Backdrop Image with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          {/* Top Glass Underlay: Uses top parts/colors of the movie poster directly under the top glass bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 'calc(var(--navbar-height, 72px) + 2px)',
              backgroundImage: `url(${getBackdropUrl(currentMovie.backdropPath)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />

          {/* Main Movie Poster: Positioned cleanly below the top bar so artwork and heads are never cropped */}
          <div
            style={{
              position: 'absolute',
              top: 'var(--navbar-height, 72px)',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${getBackdropUrl(currentMovie.backdropPath)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />

          {/* Multi-stage Gradient Shadows */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(7, 7, 13, 1) 0%, rgba(7, 7, 13, 0.7) 18%, rgba(7, 7, 13, 0) 50%)',
            pointerEvents: 'none',
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Hero Box */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: 'calc(var(--sidebar-width, 76px) + 36px)',
        width: '46%',
        minWidth: '420px',
        maxWidth: '680px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        zIndex: 20,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Formatted TMDB Movie Title Logo or Clamped Fallback Text */}
            {logoPath && !logoError ? (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  maxHeight: '110px', 
                  maxWidth: 'min(400px, 80vw)', 
                  marginBottom: '4px' 
                }}
              >
                <img
                  key={currentMovie.id}
                  src={getLogoUrl(logoPath, 'w500') || ''}
                  alt={currentMovie.title}
                  onError={() => setLogoError(true)}
                  style={{
                    maxHeight: '100px',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    objectPosition: 'left center',
                    filter: 'drop-shadow(0 4px 18px rgba(0, 0, 0, 0.95)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8))',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    display: 'block',
                  }}
                />
              </div>
            ) : (
              <h1 
                style={{ 
                  fontSize: 'clamp(32px, 3.8vw, 52px)', 
                  fontWeight: 900, 
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: '-1.2px',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-heading)',
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.8)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {currentMovie.title}
              </h1>
            )}
            
            {/* Metadata Line: Year • Runtime • TMDB Rating • Genres */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px', 
              fontSize: '14px', 
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)'
            }}>
              <span style={{ fontWeight: 600 }}>{currentMovie.releaseYear}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>{runtimeDisplay}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              
              {/* TMDB Rating Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>
                  {currentMovie.voteAverage > 0 ? currentMovie.voteAverage.toFixed(1) : '7.5'}
                </span>
                <span style={{
                  backgroundColor: '#F5C518',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '10px',
                  letterSpacing: '0.5px',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  TMDB
                </span>
              </div>

              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {genreList}
              </span>
            </div>
            
            {/* 3-line Overview */}
            <p 
              style={{ 
                fontSize: '14px', 
                lineHeight: 1.65, 
                color: 'rgba(255, 255, 255, 0.75)',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
              }}
            >
              {currentMovie.overview}
            </p>
            
            {/* Action Buttons: 1. Watch Trailer • 2. Add to Watchlist • 3. Rate the Movie */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
              {/* 1. Watch Trailer Primary Pill Button */}
              <button
                onClick={() => {
                  if (onPlayTrailer && currentMovie) onPlayTrailer(currentMovie.id);
                  setIsTrailerOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#7C3AED',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 28px',
                  borderRadius: '99px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7C3AED';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Play size={18} fill="currentColor" />
                <span>Watch Trailer</span>
              </button>

              {/* 2. Add to Watchlist Frosted Glass Button */}
              <button
                onClick={handleToggleWatchlist}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                aria-label="Add to Watchlist"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: inWatchlist ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: inWatchlist ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: inWatchlist ? '#A78BFA' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = inWatchlist ? 'rgba(124, 58, 237, 0.35)' : 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = inWatchlist ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {inWatchlist ? <Check size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
              </button>

              {/* 3. Rate the Movie Frosted Glass Button */}
              <button
                onClick={() => setIsRatingOpen(true)}
                title={currentRating ? `Your Rating: ${currentRating}/10 (Click to edit)` : "Rate this Movie"}
                aria-label="Rate this Movie"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: currentRating ? 'rgba(245, 197, 24, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: currentRating ? '1px solid rgba(245, 197, 24, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: currentRating ? '#F5C518' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentRating ? 'rgba(245, 197, 24, 0.25)' : 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentRating ? 'rgba(245, 197, 24, 0.15)' : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Star size={20} fill={currentRating ? "#F5C518" : "none"} strokeWidth={currentRating ? 1 : 2} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Segmented Slider Strip (Reference Image Bottom-Right Control) */}
      {items.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '48px',
          right: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(15, 15, 25, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '99px',
          padding: '6px 14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          zIndex: 25,
        }}>
          {/* Prev Arrow Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Segmented Line Progress Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {items.map((_, idx) => {
              const isActive = idx === safeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  style={{
                    height: '4px',
                    width: isActive ? '28px' : '10px',
                    borderRadius: '2px',
                    backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.7)' : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={handleNext}
            aria-label="Next slide"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            <ChevronRight size={18} />
          </button>

          {/* Subtle Vertical Divider */}
          <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Play" : "Pause"}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
          </button>
        </div>
      )}

      {/* Immersive Frosted Glass YouTube Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoKey={trailerKey}
        movieTitle={currentMovie.title}
        movieId={currentMovie.id}
      />

      {/* Immersive Frosted Glass 1-10 Star Rating Dialog */}
      <RatingDialog
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        movieId={currentMovie.id}
        movieTitle={currentMovie.title}
      />
    </div>
  );
};
