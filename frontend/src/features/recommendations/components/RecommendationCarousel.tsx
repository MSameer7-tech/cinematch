import type { FC } from 'react';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { HydratedRecommendation } from '../hooks/useRecommendations';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationCarouselProps {
  recommendations: HydratedRecommendation[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onCardClick?: (id: number, score: number) => void;
  onCardShown?: (id: number, score: number) => void;
  onCardAction?: (id: number, action: 'watchlisted' | 'favorited' | 'rated', score: number) => void;
  onFeedback?: (id: number, type: 'LIKE' | 'DISLIKE') => void;
}

export const RecommendationCarousel: FC<RecommendationCarouselProps> = ({ 
  recommendations, 
  onRefresh,
  isRefreshing,
  onCardClick,
  onCardShown,
  onCardAction,
  onFeedback
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth, scrollLeft } = scrollContainerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (!recommendations.length) return null;

  return (
    <div style={{ margin: '32px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        padding: '0 24px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✨</span> Recommended For You
        </h2>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: isRefreshing ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh Suggestions
          </button>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => scroll('left')}
          className="carousel-btn left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <div 
          ref={scrollContainerRef}
          className="hide-scrollbar"
          style={{ 
            display: 'flex', 
            gap: '24px', 
            overflowX: 'auto',
            padding: '12px 24px',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory'
          }}
        >
          {recommendations.map(rec => (
            <div key={rec.movie.id} style={{ scrollSnapAlign: 'start' }}>
              <RecommendationCard 
                recommendation={rec}
                onClick={(id, score) => {
                  onCardClick?.(id, score);
                  window.location.href = `/movie/${id}`;
                }}
                onFeedback={(id, isPos) => onFeedback?.(id, isPos ? 'LIKE' : 'DISLIKE')}
                onShown={(id, score) => onCardShown?.(id, score)}
                onAction={(id, action, score) => onCardAction?.(id, action, score)}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="carousel-btn right"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
