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
  const dimension = isLarge ? '48px' : size === 'small' ? '36px' : '40px';
  const iconSize = isLarge ? 20 : 18;

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: isLarge ? '14px' : '50%',
        backgroundColor: isWatchlisted ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        color: isWatchlisted ? '#c084fc' : '#fff',
        border: isWatchlisted ? '1.5px solid rgba(168, 85, 247, 0.65)' : '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: isWatchlisted ? '0 0 20px rgba(168, 85, 247, 0.35)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: toggleMutation.isPending ? 'wait' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: isWatchlisted ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.15)',
        borderColor: isWatchlisted ? '#c084fc' : 'rgba(255, 255, 255, 0.35)'
      }}
      whileTap={{ scale: 0.92 }}
    >
      {isWatchlisted ? <Check size={iconSize} strokeWidth={2.5} /> : <Plus size={iconSize} strokeWidth={2.2} />}
    </motion.button>
  );
};
