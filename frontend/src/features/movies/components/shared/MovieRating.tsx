import type { FC } from 'react';
import { Star } from 'lucide-react';

interface MovieRatingProps {
  rating: number;
  showText?: boolean;
}

export const MovieRating: FC<MovieRatingProps> = ({ rating, showText = true }) => {
  // TMDB ratings are out of 10. We can convert to percentage or keep out of 10.
  const formattedRating = rating.toFixed(1);
  
  // Decide color based on rating score
  const getColor = () => {
    if (rating >= 7.5) return '#10b981'; // Emerald
    if (rating >= 6) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <Star 
        size={14} 
        style={{ color: getColor(), fill: getColor() }} 
      />
      <span style={{ 
        color: getColor(), 
        fontWeight: 700, 
        fontSize: '13px',
        letterSpacing: '0.5px'
      }}>
        {formattedRating}
        {showText && <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '11px', marginLeft: '2px' }}>/ 10</span>}
      </span>
    </div>
  );
};
