import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRatings, useRateMovie, useDeleteRating } from '../hooks/useRatings';

interface RatingSelectorProps {
  movieId: number;
}

export const RatingSelector: FC<RatingSelectorProps> = ({ movieId }) => {
  const { data: ratings } = useRatings();
  const rateMutation = useRateMovie();
  const deleteMutation = useDeleteRating();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const existingRating = ratings?.find(entry => entry.media_id === movieId)?.rating;

  const handleRate = (rating: number) => {
    if (existingRating === rating) {
      deleteMutation.mutate(movieId);
    } else {
      rateMutation.mutate({ movieId, rating });
    }
  };

  const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
        Rate this movie:
      </div>
      <div 
        style={{ 
          display: 'flex', 
          gap: '4px',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onMouseLeave={() => setHoveredRating(null)}
      >
        {scale.map((num) => {
          const isSelected = existingRating === num;
          const isHovered = hoveredRating !== null && num <= hoveredRating;
          const isActive = existingRating !== undefined && hoveredRating === null && num <= existingRating;
          
          let bgColor = 'transparent';
          let textColor = 'var(--text-secondary)';
          let borderColor = 'transparent';

          if (isSelected) {
            bgColor = 'var(--primary-color)';
            textColor = '#fff';
            borderColor = 'var(--primary-color)';
          } else if (isHovered || isActive) {
            bgColor = 'rgba(168, 85, 247, 0.2)';
            textColor = 'var(--primary-color-light)';
            borderColor = 'rgba(168, 85, 247, 0.4)';
          }

          return (
            <motion.button
              key={num}
              onClick={() => handleRate(num)}
              onMouseEnter={() => setHoveredRating(num)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s ease',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {num}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
