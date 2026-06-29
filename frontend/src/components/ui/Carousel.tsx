import { useRef } from 'react';
import type { FC, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: ReactNode;
}

export const Carousel: FC<CarouselProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Scroll controls buttons (desktop only, hover display) */}
      <button
        onClick={() => handleScroll('left')}
        style={{
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(24, 24, 31, 0.85)',
          border: '1px solid var(--border-color)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.borderColor = 'var(--primary-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(24, 24, 31, 0.85)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Horizontal snapping list scrollbar hidden */}
      <div
        ref={containerRef}
        className="carousel-scrollbar-hidden"
        style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          padding: '10px 4px 20px 4px',
        }}
      >
        {children}
      </div>

      <button
        onClick={() => handleScroll('right')}
        style={{
          position: 'absolute',
          right: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(24, 24, 31, 0.85)',
          border: '1px solid var(--border-color)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.borderColor = 'var(--primary-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(24, 24, 31, 0.85)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
