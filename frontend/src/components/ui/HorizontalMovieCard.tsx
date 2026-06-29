import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

interface HorizontalMovieCardProps {
  title?: string;
  rating?: number;
  imageUrl?: string;
  releaseYear?: number;
  progress?: number; // 0 to 100 representing percentage watched
  isLoading?: boolean;
  onClick?: () => void;
}

export const HorizontalMovieCard: FC<HorizontalMovieCardProps> = ({
  title = '',
  rating,
  imageUrl,
  releaseYear,
  progress,
  isLoading = false,
  onClick,
}) => {
  if (isLoading) {
    return (
      <div style={{ width: '100%', minWidth: '260px', maxWidth: '320px' }}>
        <LoadingSkeleton height="180px" borderRadius="16px" style={{ marginBottom: '12px' }} />
        <LoadingSkeleton height="20px" width="70%" borderRadius="4px" style={{ marginBottom: '6px' }} />
        <LoadingSkeleton height="16px" width="40%" borderRadius="4px" />
      </div>
    );
  }

  const fallbackBackground = `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(24, 24, 31, 0.95) 100%)`;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      style={{
        width: '100%',
        minWidth: '260px',
        maxWidth: '320px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Backdrop Landscape Image Container */}
      <div
        style={{
          width: '100%',
          height: '180px',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-color)',
          background: fallbackBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '28px' }}>🎥</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              No Backdrop
            </span>
          </div>
        )}

        {/* Play Icon Overlay on Hover */}
        <div
          className="play-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(9, 9, 11, 0.4)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
            }}
          >
            <Play size={20} fill="#fff" style={{ marginLeft: '2px' }} />
          </div>
        </div>

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

        {/* Progress bar at the bottom */}
        {progress !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: 'var(--primary-color)',
                boxShadow: '0 0 8px var(--primary-color)',
              }}
            />
          </div>
        )}
      </div>

      {/* Details metadata */}
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
        {releaseYear && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {releaseYear}
          </span>
        )}
      </div>
    </motion.div>
  );
};
