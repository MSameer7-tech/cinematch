import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Bookmark, Heart, Info, Sparkles } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

interface MovieCardProps {
  title?: string;
  rating?: number;
  imageUrl?: string;
  releaseYear?: number;
  genres?: string[];
  runtime?: string;
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

  // Generate a deterministic Match % based on title length for mock variety
  const matchPercentage = useMemo(() => {
    if (!title) return 85;
    const base = 80 + (title.length % 20);
    return Math.min(base, 99);
  }, [title]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', minWidth: '190px', maxWidth: '230px' }}>
        <LoadingSkeleton style={{ aspectRatio: '2/3', marginBottom: '12px' }} borderRadius="16px" />
        <LoadingSkeleton height="20px" width="80%" borderRadius="4px" style={{ marginBottom: '6px' }} />
        <LoadingSkeleton height="16px" width="60%" borderRadius="4px" />
      </div>
    );
  }

  const fallbackBackground = `linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(24, 24, 31, 0.95) 100%)`;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        width: '100%',
        minWidth: '190px',
        maxWidth: '230px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 2:3 Aspect Ratio Card Container */}
      <div
        style={{
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          background: fallbackBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered 
            ? '0 12px 30px rgba(168, 85, 247, 0.2), 0 4px 15px rgba(0, 0, 0, 0.5)' 
            : '0 4px 15px rgba(0, 0, 0, 0.4)',
          marginBottom: '12px',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
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
            <span style={{ fontSize: '36px' }}>🎬</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              No Poster
            </span>
          </div>
        )}

        {/* Rating Badge (Always visible on top right) */}
        {rating !== undefined && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 5,
            }}
          >
            <Star size={11} fill="var(--warning-color)" color="var(--warning-color)" />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-number)', color: '#fff' }}>
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Apple TV Hover Overlay - bottom-to-top gradient fade with metadata and actions */}
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
                background: 'linear-gradient(to top, rgba(9, 9, 11, 0.98) 0%, rgba(9, 9, 11, 0.6) 50%, rgba(9, 9, 11, 0.1) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '16px',
                zIndex: 8,
              }}
            >
              {/* Match % + Year Metadata Overlay */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-number)' }}>
                    {matchPercentage}% MATCH
                  </span>
                </div>
                {releaseYear && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-number)' }}>
                    {releaseYear}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Play size={14} fill="#fff" style={{ marginLeft: '1px' }} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '32px',
                    height: '32px',
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
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Bookmark size={13} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '32px',
                    height: '32px',
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
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Heart size={13} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  style={{
                    width: '32px',
                    height: '32px',
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
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Info size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details text below the card */}
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
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-number)' }}>
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
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-number)' }}>
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
