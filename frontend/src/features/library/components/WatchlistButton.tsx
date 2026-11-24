import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useWatchlist, useToggleWatchlist } from '../hooks/useWatchlist';

interface WatchlistButtonProps {
  movieId: number;
  size?: 'small' | 'medium' | 'large';
}

export const WatchlistButton: FC<WatchlistButtonProps> = ({ movieId, size = 'medium' }) => {
  const { data: watchlist } = useWatchlist();
  const toggleMutation = useToggleWatchlist();

  const isWatchlisted = watchlist?.some(entry => entry.media_id === movieId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMutation.mutate({ movieId, isWatchlisted });
  };

  const isLarge = size === 'large';
  const dimension = isLarge ? '46px' : size === 'small' ? '36px' : '40px';
  const iconSize = isLarge ? 19 : 17;

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: isLarge ? '12px' : '50%',
        backgroundColor: isWatchlisted ? 'rgba(124, 58, 237, 0.18)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        color: isWatchlisted ? '#c4b5fd' : '#e2e8f0',
        border: isWatchlisted ? '1px solid rgba(124, 58, 237, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: toggleMutation.isPending ? 'wait' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ 
        scale: 1.04, 
        backgroundColor: isWatchlisted ? 'rgba(124, 58, 237, 0.26)' : 'rgba(255, 255, 255, 0.12)',
        borderColor: isWatchlisted ? 'rgba(124, 58, 237, 0.6)' : 'rgba(255, 255, 255, 0.25)'
      }}
      whileTap={{ scale: 0.94 }}
    >
      {isWatchlisted ? <Check size={iconSize} strokeWidth={2.4} /> : <Plus size={iconSize} strokeWidth={2} />}
    </motion.button>
  );
};
