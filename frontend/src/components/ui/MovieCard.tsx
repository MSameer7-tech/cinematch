import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

interface MovieCardProps {
  title?: string;
  rating?: number;
  imageUrl?: string;
  releaseYear?: number;
  genres?: string[];
  isLoading?: boolean;
  onClick?: () => void;
}

export const MovieCard: FC<MovieCardProps> = ({
  title = '',
  rating,
  imageUrl,
  releaseYear,
  genres = [],
  isLoading = false,
  onClick,
}) => {
  if (isLoading) {
    return (
      <div style={{ width: '100%', minWidth: '160px', maxWidth: '220px' }}>
        <LoadingSkeleton height="280px" borderRadius="16px" style={{ marginBottom: '12px' }} />
        <LoadingSkeleton height="20px" width="80%" borderRadius="4px" style={{ marginBottom: '6px' }} />
        <LoadingSkeleton height="16px" width="60%" borderRadius="4px" />
      </div>
    );
  }

  const fallbackBackground = `linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(24, 24, 31, 0.95) 100%)`;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      style={{
        width: '100%',
        minWidth: '160px',
        maxWidth: '220px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Poster Image Container */}
      <div
        style={{
          width: '100%',
          height: '280px',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-color)',
          background: fallbackBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          marginBottom: '12px',
        }}
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
            <span style={{ fontSize: '32px' }}>🎬</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
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
              backgroundColor: 'rgba(24, 24, 31, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 5,
            }}
          >
            <Star size={12} fill="var(--warning-color)" color="var(--warning-color)" />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-number)', color: '#fff' }}>
              {rating.toFixed(1)}
            </span>
          </div>
        )}
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
          }}
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
            <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600 }}>
              {genres[0]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
