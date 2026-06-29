import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Info } from 'lucide-react';
import type { Movie } from '../../types/movie.types';
import { getPosterUrl } from '../../utils/image';
import { MovieRating } from '../shared/MovieRating';

interface MovieCardProps {
  movie: Movie;
  onClick?: (id: number) => void;
}

export const MovieCard: FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <motion.div
      className="movie-card-container"
      style={{
        position: 'relative',
        width: '100%',
        minWidth: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: 'pointer',
      }}
      whileHover="hover"
      initial="initial"
    >
      {/* Poster Image Container */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-elevated)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
        onClick={() => onClick?.(movie.id)}
      >
        <img
          src={getPosterUrl(movie.posterPath)}
          alt={movie.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Hover Overlay with Action Buttons */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.4) 50%, rgba(9, 9, 11, 0.2) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            opacity: 0,
          }}
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Main Play Action */}
          <motion.button
            className="action-btn-primary"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
            }}
            variants={{
              initial: { y: 20, scale: 0.9 },
              hover: { y: 0, scale: 1 }
            }}
            whileHover={{ scale: 1.1 }}
          >
            <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
          </motion.button>
          
          {/* Secondary Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              className="action-btn-secondary"
              title="Add to Watchlist"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              variants={{
                initial: { y: 20, opacity: 0 },
                hover: { y: 0, opacity: 1 }
              }}
              transition={{ delay: 0.05 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Plus size={20} />
            </motion.button>
            <motion.button
              className="action-btn-secondary"
              title="Details"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              variants={{
                initial: { y: 20, opacity: 0 },
                hover: { y: 0, opacity: 1 }
              }}
              transition={{ delay: 0.1 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Info size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Movie Metadata */}
      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h4 
          style={{ 
            margin: 0, 
            fontSize: '14px', 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={movie.title}
        >
          {movie.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {movie.releaseYear}
          </span>
          <MovieRating rating={movie.voteAverage} showText={false} />
        </div>
      </div>
    </motion.div>
  );
};
