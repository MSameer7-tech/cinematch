import type { FC } from 'react';
import { motion } from 'framer-motion';
import { WatchlistButton } from './WatchlistButton';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { Info } from 'lucide-react';

interface MovieActionsProps {
  movieId: number;
  showInfo?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const MovieActions: FC<MovieActionsProps> = ({ movieId, showInfo = true, size = 'medium' }) => {
  const isLarge = size === 'large';
  const dimension = isLarge ? '48px' : size === 'small' ? '36px' : '40px';

  return (
    <div style={{ display: 'flex', gap: isLarge ? '10px' : '8px', alignItems: 'center' }}>
      <WatchlistButton movieId={movieId} size={size} />
      <FavoriteButton movieId={movieId} size={size} />
      <ShareButton movieId={movieId} size={size} />
      
      {showInfo && (
        <motion.button
          className="action-btn-secondary"
          title="Details"
          onClick={(e) => {
            e.preventDefault();
          }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: isLarge ? '14px' : '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            borderColor: 'rgba(255, 255, 255, 0.35)'
          }}
          whileTap={{ scale: 0.92 }}
        >
          <Info size={isLarge ? 20 : 18} />
        </motion.button>
      )}
    </div>
  );
};
