import { useState } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Bookmark, Heart, Info } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

interface MovieCardProps {
  title?: string;
  rating?: number;
  imageUrl?: string;
  releaseYear?: number;
  genres?: string[];
  runtime?: string; // e.g. "124m"
  isLoading?: boolean;
  onClick?: () => void;
}

export const MovieCard: FC<MovieCardProps> = ({
  title = '',
  rating,
  imageUrl,
  releaseYear,
  genres = [],
  runtime = '120m',
  isLoading = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading) {
    return (
      <div style={{ width: '100%', minWidth: '180px', maxWidth: '230px' }}>
        <LoadingSkeleton height="300px" borderRadius="var(--radius-card)" style={{ marginBottom: '12px' }} />
        <LoadingSkeleton height="20px" width="80%" borderRadius="4px" style={{ marginBottom: '6px' }} />
        <LoadingSkeleton height="16px" width="60%" borderRadius="4px" />
      </div>
    );
  }

  const fallbackBackground = `linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(24, 24, 31, 0.95) 100%)`;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        width: '100%',
        minWidth: '180px',
        maxWidth: '230px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Poster Image Container */}
      <div
        style={{
          width: '100%',
          height: '300px',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-color)',
          background: fallbackBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          marginBottom: '12px',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '36px' }}>🎬</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              No Poster
            </span>
          </div>
        )}

        {/* Rating overlay badge */}
        {rating !== undefined && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 5,
            }}
          >
            <Star size={12} fill="var(--warning-color)" color="var(--warning-color)" />
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-number)', color: '#fff' }}>
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Apple TV Style Actions Overlay on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.4) 60%, rgba(9, 9, 11, 0.1) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '20px',
                zIndex: 8,
              }}
            >
              {/* Overlay Quick Buttons Grid */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Play size={16} fill="#fff" style={{ marginLeft: '2px' }} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Bookmark size={14} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Heart size={14} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Info size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details metadata info */}
      <div style={{ padding: '0 4px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#fff',
            margin: '0 0 4px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.2s ease',
          }}
          className="movie-card-title"
        >
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {releaseYear && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {releaseYear}
            </span>
          )}
          {genres.length > 0 && (
            <>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {genres[0]}
              </span>
            </>
          )}
          {runtime && (
            <>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {runtime}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default MovieCard;
