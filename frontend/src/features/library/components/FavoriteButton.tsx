import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  movieId: number;
  size?: 'small' | 'medium' | 'large';
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({ movieId, size = 'medium' }) => {
  const { data: favorites } = useFavorites();
  const toggleMutation = useToggleFavorite();

  const isFavorited = favorites?.some(entry => entry.media_id === movieId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMutation.mutate({ movieId, isFavorited });
  };

  const isLarge = size === 'large';
  const dimension = isLarge ? '46px' : size === 'small' ? '36px' : '40px';
  const iconSize = isLarge ? 19 : 17;

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: isLarge ? '12px' : '50%',
        backgroundColor: isFavorited ? 'rgba(225, 29, 72, 0.18)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        color: isFavorited ? '#fda4af' : '#e2e8f0',
        border: isFavorited ? '1px solid rgba(225, 29, 72, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: toggleMutation.isPending ? 'wait' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ 
        scale: 1.04, 
        backgroundColor: isFavorited ? 'rgba(225, 29, 72, 0.26)' : 'rgba(255, 255, 255, 0.12)',
        borderColor: isFavorited ? 'rgba(225, 29, 72, 0.6)' : 'rgba(255, 255, 255, 0.25)'
      }}
      whileTap={{ scale: 0.94 }}
    >
      <Heart size={iconSize} fill={isFavorited ? "currentColor" : "none"} strokeWidth={2} />
    </motion.button>
  );
};
