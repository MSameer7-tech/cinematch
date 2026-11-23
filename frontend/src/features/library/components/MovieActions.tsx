import type { FC } from 'react';
import { motion } from 'framer-motion';
import { WatchlistButton } from './WatchlistButton';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { Info } from 'lucide-react';

interface MovieActionsProps {
  movieId: number;
  showInfo?: boolean;
}

export const MovieActions: FC<MovieActionsProps> = ({ movieId, showInfo = true }) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <WatchlistButton movieId={movieId} />
      <FavoriteButton movieId={movieId} />
      <ShareButton movieId={movieId} />
      
      {showInfo && (
        <motion.button
          className="action-btn-secondary"
          title="Details"
          onClick={(e) => {
            // Navigation handles bubble up, but we prevent default just in case
            e.preventDefault();
            // Optional: You could navigate here or rely on the parent Card's onClick
          }}
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
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          whileTap={{ scale: 0.9 }}
        >
          <Info size={20} />
        </motion.button>
      )}
    </div>
  );
};
