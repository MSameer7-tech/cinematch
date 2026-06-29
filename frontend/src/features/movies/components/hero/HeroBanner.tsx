import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PlayTrailerButton } from '../shared/PlayTrailerButton';
import { MovieRating } from '../shared/MovieRating';
import type { Movie } from '../../types/movie.types';
import { getBackdropUrl } from '../../utils/image';

interface HeroBannerProps {
  movie: Movie;
  onPlayTrailer?: (id: number) => void;
  onAddWatchlist?: (id: number) => void;
}

export const HeroBanner: FC<HeroBannerProps> = ({ movie, onPlayTrailer, onAddWatchlist }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '80vh',
      minHeight: '600px',
      maxHeight: '900px',
      overflow: 'hidden',
    }}>
      {/* Background Image with Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${getBackdropUrl(movie.backdropPath)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.6) 50%, rgba(9, 9, 11, 0.1) 100%)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(9, 9, 11, 1) 0%, rgba(9, 9, 11, 0) 40%)',
        }} />
      </div>
      
      {/* Content Container */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '40px',
        width: '50%',
        minWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 10,
      }}>
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ 
            fontSize: 'clamp(40px, 5vw, 64px)', 
            fontWeight: 800, 
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-1px'
          }}
        >
          {movie.title}
        </motion.h1>
        
        {/* Badges/Metadata */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <MovieRating rating={movie.voteAverage} />
          
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{movie.releaseYear}</span>
          
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <div style={{ 
            padding: '2px 8px', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            HD
          </div>
        </motion.div>
        
        {/* Overview (truncated) */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          style={{ 
            fontSize: '16px', 
            lineHeight: 1.6, 
            color: 'var(--text-secondary)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {movie.overview}
        </motion.p>
        
        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          style={{ display: 'flex', gap: '16px', marginTop: '8px' }}
        >
          <PlayTrailerButton onClick={() => onPlayTrailer?.(movie.id)} size="lg" />
          
          <button
            onClick={() => onAddWatchlist?.(movie.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-button)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <Plus size={20} />
            Watchlist
          </button>

          <button
            onClick={() => window.location.href = `/movie/${movie.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-button)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            More Info
          </button>
        </motion.div>
      </div>
    </div>
  );
};
