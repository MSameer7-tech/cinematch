import type { FC } from 'react';
import type { CastMember } from '../../types/movie.types';
import { getPosterUrl } from '../../utils/image';
import { User } from 'lucide-react';

interface CastCarouselProps {
  cast: CastMember[];
}

export const CastCarousel: FC<CastCarouselProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div 
      className="cast-carousel"
      style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
    >
      <style>{`
        .cast-carousel::-webkit-scrollbar {
          display: none;
        }
        .cast-card {
          flex: 0 0 auto;
          width: 140px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .cast-image-container {
          width: 140px;
          height: 210px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-surface);
          display: flex;
          align-items: center;
          justifyContent: center;
        }
        .cast-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cast-name {
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cast-character {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
      
      {cast.map(person => (
        <div key={person.id} className="cast-card">
          <div className="cast-image-container">
            {person.profilePath ? (
              <img 
                src={getPosterUrl(person.profilePath, 'w185')} 
                alt={person.name} 
                loading="lazy"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <User size={40} />
              </div>
            )}
          </div>
          <div>
            <div className="cast-name" title={person.name}>{person.name}</div>
            <div className="cast-character" title={person.character}>{person.character}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
