import { type FC, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from '../card/MovieCard';
import type { MovieDetails } from '../../types/movie.types';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useInfiniteHomepageSection } from '../../../home/hooks/useHomepage';
import { useRecommendationTracking } from '../../../recommendations/hooks/useRecommendationTracking';
import { MovieCardSkeleton } from '../../../../components/loading/MovieCardSkeleton';

interface MovieCarouselProps {
  title: string;
  movies: (MovieDetails & { score?: number; reasons?: string[] })[];
  sectionId?: string;
  page?: number;
  pageSize?: number;
  totalMovies?: number;
  hasMore?: boolean;
  nextPage?: number | null;
  onMovieClick?: (id: number, position: number, sectionId: string) => void;
  onMovieShown?: (id: number, position: number, sectionId: string) => void;
}

const TrackableMovieCard: FC<{
  movie: MovieDetails & { score?: number; reasons?: string[] };
  position: number;
  sectionId: string;
  onShown?: (id: number, position: number, sectionId: string) => void;
  onClick?: (id: number, position: number, sectionId: string) => void;
}> = ({ movie, position, sectionId, onShown, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedShown = useRef(false);

  useEffect(() => {
    if (!onShown || hasTrackedShown.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onShown(movie.id, position, sectionId);
        hasTrackedShown.current = true;
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [movie.id, position, sectionId, onShown]);

  return (
    <div ref={cardRef} style={{ width: '100%', minWidth: 0 }}>
      <MovieCard 
        movie={movie} 
        onClick={() => onClick?.(movie.id, position, sectionId)} 
      />
    </div>
  );
};

const SentinelCard: FC<{ onVisible: () => void }> = ({ onVisible }) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onVisible();
      }
    }, { 
      root: null, // viewport
      rootMargin: '0px 300px 0px 300px', // trigger 300px before reaching edge (prefetching)
      threshold: 0.1 
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={sentinelRef} style={{ width: '1px', flex: '0 0 1px' }} />;
};

export const MovieCarousel: FC<MovieCarouselProps> = ({ 
  title, 
  movies, 
  sectionId = 'general',
  page = 1,
  pageSize = 20,
  totalMovies = 0,
  hasMore = false,
  nextPage = null,
  onMovieClick,
  onMovieShown
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useRecommendationTracking();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Pagination Config
  const isPaginationEnabled = sectionId !== 'continue_watching' && !!user?.id;
  
  const initialPageData = {
    movies,
    page,
    pageSize,
    totalMovies: totalMovies || movies.length,
    hasMore,
    nextPage,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    refetch
  } = useInfiniteHomepageSection(
    sectionId, 
    user?.id || '', 
    isPaginationEnabled ? initialPageData : undefined
  );

  // Flatten and client-side deduplicate movie lists before rendering (Deduplication optimization)
  const rawList = isPaginationEnabled && data
    ? data.pages.flatMap((p) => p.movies)
    : movies;

  const deduplicatedMovies: typeof movies = [];
  const seenIds = new Set<number>();
  
  for (const m of rawList) {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      deduplicatedMovies.push(m);
    }
  }

  // Track page_loaded analytics depth (Phase 10)
  const pageCount = isPaginationEnabled && data ? data.pages.length : 1;
  useEffect(() => {
    if (isPaginationEnabled && pageCount > 1 && user?.id) {
      trackEvent(user.id, `page_loaded:${sectionId}`, pageCount);
    }
  }, [pageCount, user?.id, sectionId, isPaginationEnabled, trackEvent]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!deduplicatedMovies?.length) return null;

  return (
    <section style={{ margin: '40px 0', padding: '0 48px', position: 'relative' }} className="movie-carousel-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          margin: 0,
          letterSpacing: '-0.3px',
          color: 'rgba(255, 255, 255, 0.95)'
        }}>
          {title}
        </h2>
        
        {/* Actions & Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginLeft: 'auto' }}>
          <button
            onClick={() => navigate('/discover')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              padding: '4px 6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            See All <ChevronRight size={14} />
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => scroll('left')}
              disabled={!showLeftArrow}
              className="carousel-nav-btn"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: showLeftArrow ? 'pointer' : 'default',
                opacity: showLeftArrow ? 1 : 0.3,
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!showRightArrow}
              className="carousel-nav-btn"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: showRightArrow ? 'pointer' : 'default',
                opacity: showRightArrow ? 1 : 0.3,
                transition: 'all 0.2s',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '20px',
          paddingTop: '10px'
        }}
      >
        {deduplicatedMovies.map((movie, index) => (
          <div key={movie.id} style={{ flex: '0 0 200px', width: '200px', minWidth: 0 }}>
            <TrackableMovieCard 
              movie={movie}
              position={index + 1}
              sectionId={sectionId}
              onShown={onMovieShown}
              onClick={(id, pos, sId) => {
                if (onMovieClick) {
                  onMovieClick(id, pos, sId);
                } else {
                  navigate(`/movie/${id}`);
                }
              }}
            />
          </div>
        ))}

        {/* IntersectionObserver Sentinel for Infinite Scroll (Phase 8) */}
        {isPaginationEnabled && hasNextPage && (
          <SentinelCard onVisible={() => {
            if (!isFetchingNextPage && !isError) {
              fetchNextPage();
            }
          }} />
        )}

        {/* Skeletons loader */}
        {isFetchingNextPage && (
          <>
            <div style={{ flex: '0 0 200px', width: '200px', minWidth: 0 }}><MovieCardSkeleton /></div>
            <div style={{ flex: '0 0 200px', width: '200px', minWidth: 0 }}><MovieCardSkeleton /></div>
            <div style={{ flex: '0 0 200px', width: '200px', minWidth: 0 }}><MovieCardSkeleton /></div>
          </>
        )}

        {/* Error Fallback (Phase 9) */}
        {isError && (
          <div 
            style={{ 
              flex: '0 0 200px', 
              width: '200px', 
              aspectRatio: '2/3',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.02)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '16px',
              textAlign: 'center',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Couldn't load more.
            </span>
            <button 
              onClick={() => refetch()}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
