import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';
import type { CastMember } from '../../types/movie.types';
import { getPosterUrl } from '../../utils/image';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';

interface CastCarouselProps {
  cast: CastMember[];
}

export const CastCarousel: FC<CastCarouselProps> = ({ cast }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [cast]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 480;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  if (!cast || cast.length === 0) return null;

  return (
    <div className="cast-carousel-wrapper">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button 
          className="cast-nav-arrow cast-nav-left"
          onClick={() => handleScroll('left')}
          title="Scroll Left"
          aria-label="Scroll cast left"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Scrollable Cast Container */}
      <div 
        ref={scrollRef} 
        className="cast-carousel-scroll"
        onScroll={checkScroll}
      >
        {cast.map((person) => {
          const profileUrl = person.profilePath ? getPosterUrl(person.profilePath, 'w185') : null;
          return (
            <div 
              key={person.id} 
              className="cast-item-card"
            >
              <div className="cast-item-image-box">
                {profileUrl ? (
                  <img 
                    src={profileUrl} 
                    alt={person.name} 
                    className="cast-item-image"
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    color: 'rgba(255, 255, 255, 0.35)',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <User size={26} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.45)' }}>No Photo</span>
                  </div>
                )}
              </div>

              <div className="cast-item-meta">
                <span className="cast-item-name" title={person.name}>
                  {person.name}
                </span>
                <span className="cast-item-character" title={person.character || 'Cast'}>
                  {person.character || 'Cast'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button 
          className="cast-nav-arrow cast-nav-right"
          onClick={() => handleScroll('right')}
          title="Scroll Right"
          aria-label="Scroll cast right"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
};
