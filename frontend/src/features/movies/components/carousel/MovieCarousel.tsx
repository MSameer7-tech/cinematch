import { type FC, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from '../card/MovieCard';
import type { Movie } from '../../types/movie.types';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onMovieClick?: (id: number) => void;
}

export const MovieCarousel: FC<MovieCarouselProps> = ({ title, movies, onMovieClick }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true); // Assuming we have enough movies to scroll

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    // Show left arrow if we've scrolled past the start
    setShowLeftArrow(scrollLeft > 0);
    // Show right arrow if we haven't reached the end (with a 10px buffer)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    
    // Scroll by ~75% of the visible width
    const scrollAmount = container.clientWidth * 0.75;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!movies?.length) return null;

  return (
    <section style={{ margin: '40px 0', padding: '0 40px', position: 'relative' }} className="movie-carousel-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h2>
        
        {/* Navigation Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className="carousel-nav-btn"
            style={{
              width: '32px',
              height: '32px',
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
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className="carousel-nav-btn"
            style={{
              width: '32px',
              height: '32px',
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
            <ChevronRight size={18} />
          </button>
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
          // Padding bottom to accommodate card hover scale without clipping
          paddingBottom: '20px',
          paddingTop: '10px'
        }}
      >
        {movies.map((movie) => (
          <div key={movie.id} style={{ flex: '0 0 200px' }}>
            <MovieCard 
              movie={movie} 
              onClick={(id) => onMovieClick ? onMovieClick(id) : navigate(`/movie/${id}`)} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};
