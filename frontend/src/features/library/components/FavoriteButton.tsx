import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  movieId: number;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({ movieId }) => {
  const { data: favorites } = useFavorites();
  const toggleMutation = useToggleFavorite();

  const isFavorited = favorites?.some(entry => entry.media_id === movieId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMutation.mutate({ movieId, isFavorited });
  };

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isFavorited ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        color: isFavorited ? '#ef4444' : '#fff',
        border: isFavorited ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: toggleMutation.isPending ? 'wait' : 'pointer',
      }}
      whileHover={{ backgroundColor: isFavorited ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)' }}
      whileTap={{ scale: 0.9 }}
    >
      <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
    </motion.button>
  );
};
