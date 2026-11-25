import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { HydratedRecommendation } from '../hooks/useRecommendations';
import { getMatchColor } from '../utils/matchColor';
import { formatReason } from '../utils/formatReason';
import { getPosterUrl } from '../../movies/utils/image';
import { MovieRating } from '../../movies/components/shared/MovieRating';
import { MovieActions } from '../../library/components/MovieActions';

interface RecommendationCardProps {
  recommendation: HydratedRecommendation;
  onClick?: (id: number, score: number) => void;
  onFeedback?: (id: number, isPositive: boolean) => void;
  onShown?: (id: number, score: number) => void;
  onAction?: (id: number, action: 'watchlisted' | 'favorited' | 'rated', score: number) => void;
}

export const RecommendationCard: FC<RecommendationCardProps> = ({ 
  recommendation, 
  onClick,
  onFeedback,
  onShown,
  onAction
}) => {
  const { movie, score, reasons } = recommendation;
  const matchPercentage = Math.min(100, Math.max(1, score > 1 ? Math.round(score) : Math.round(score * 100)));
  const matchColorClass = getMatchColor(score);
  
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedShown = useRef(false);

  useEffect(() => {
    if (!onShown || hasTrackedShown.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onShown(movie.id, score);
        hasTrackedShown.current = true;
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, [movie.id, score, onShown]);

  const handleFeedback = (isPositive: boolean) => {
    setFeedback(isPositive ? 'positive' : 'negative');
    onFeedback?.(movie.id, isPositive);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="recommendation-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        width: '320px',
        flexShrink: 0,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Left: Poster */}
        <div 
          style={{
            width: '100px',
            aspectRatio: '2/3',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onClick={() => onClick?.(movie.id, score)}
        >
          <img
            src={getPosterUrl(movie.posterPath)}
            alt={movie.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        
        {/* Right: Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div>
            <div className={`font-bold text-lg ${matchColorClass}`}>
              {matchPercentage}% Match
            </div>
            <h3 
              style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => onClick?.(movie.id, score)}
            >
              {movie.title}
            </h3>
            
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {(movie.genres ?? []).map(g => g.name).join(', ')}
            </div>
            
            <MovieRating rating={movie.voteAverage} showText={true} />
          </div>
          
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}
            onClickCapture={(e) => {
              const target = e.target as HTMLElement;
              const button = target.closest('button');
              if (button) {
                const label = button.getAttribute('aria-label') || button.title || '';
                const lowerLabel = label.toLowerCase();
                if (lowerLabel.includes('watchlist')) onAction?.(movie.id, 'watchlisted', score);
                else if (lowerLabel.includes('favorite')) onAction?.(movie.id, 'favorited', score);
                else if (lowerLabel.includes('rate') || lowerLabel.includes('star')) onAction?.(movie.id, 'rated', score);
              }
            }}
          >
            <MovieActions movieId={movie.id} showInfo={false} />
            <div style={{ flex: 1 }} />
            
            {/* Feedback Buttons */}
            <button 
              onClick={() => handleFeedback(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: feedback === 'positive' ? 'var(--primary-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              title="Good recommendation"
            >
              <ThumbsUp size={18} />
            </button>
            <button 
              onClick={() => handleFeedback(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: feedback === 'negative' ? 'var(--danger-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              title="Not interested"
            >
              <ThumbsDown size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom: Reasons */}
      <div style={{ 
        marginTop: '8px', 
        paddingTop: '12px', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {(reasons ?? []).map((reason, idx) => (
          <div key={idx} style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            {formatReason(reason)}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
