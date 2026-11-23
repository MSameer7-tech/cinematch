import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useWatchlist, useToggleWatchlist } from '../hooks/useWatchlist';

interface WatchlistButtonProps {
  movieId: number;
}

export const WatchlistButton: FC<WatchlistButtonProps> = ({ movieId }) => {
  const { data: watchlist } = useWatchlist();
  const toggleMutation = useToggleWatchlist();

  const isWatchlisted = watchlist?.some(entry => entry.media_id === movieId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMutation.mutate({ movieId, isWatchlisted });
  };

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isWatchlisted ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        border: isWatchlisted ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: toggleMutation.isPending ? 'wait' : 'pointer',
      }}
      whileHover={{ backgroundColor: isWatchlisted ? 'var(--primary-color-hover)' : 'rgba(255, 255, 255, 0.2)' }}
      whileTap={{ scale: 0.9 }}
    >
      {isWatchlisted ? <Check size={20} /> : <Plus size={20} />}
    </motion.button>
  );
};
