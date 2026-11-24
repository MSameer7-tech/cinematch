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
  const dimension = isLarge ? '48px' : size === 'small' ? '36px' : '40px';
  const iconSize = isLarge ? 20 : 18;

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: isLarge ? '14px' : '50%',
        backgroundColor: isFavorited ? 'rgba(244, 63, 94, 0.22)' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        color: isFavorited ? '#fb7185' : '#fff',
        border: isFavorited ? '1.5px solid rgba(244, 63, 94, 0.65)' : '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: isFavorited ? '0 0 20px rgba(244, 63, 94, 0.35)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: toggleMutation.isPending ? 'wait' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: isFavorited ? 'rgba(244, 63, 94, 0.32)' : 'rgba(255, 255, 255, 0.15)',
        borderColor: isFavorited ? '#f43f5e' : 'rgba(255, 255, 255, 0.35)'
      }}
      whileTap={{ scale: 0.92 }}
    >
      <Heart size={iconSize} fill={isFavorited ? "currentColor" : "none"} strokeWidth={2} />
    </motion.button>
  );
};
