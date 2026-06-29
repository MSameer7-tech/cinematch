import type { FC } from 'react';
import { useState } from 'react';
import { Star, Clock, Calendar, Play } from 'lucide-react';
import type { MovieDetails, Video } from '../../types/movie.types';
import { getBackdropUrl, getPosterUrl } from '../../utils/image';
import { TrailerModal } from './TrailerModal';

interface MovieHeroProps {
  movie: MovieDetails;
  videos: Video[];
}

export const MovieHero: FC<MovieHeroProps> = ({ movie, videos }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Find an official YouTube trailer
  const trailer = videos.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.find(
    (v) => v.site === 'YouTube' // Fallback to any youtube video
  );

  const backdropUrl = getBackdropUrl(movie.backdropPath, 'w1280');
  const posterUrl = getPosterUrl(movie.posterPath, 'w500');

  // Format runtime
  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <>
      <div 
        className="movie-hero"
        style={{
          position: 'relative',
          width: '100%',
          height: '70vh',
          minHeight: '500px',
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        {/* Gradient Overlays */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.7) 40%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(9, 9, 11, 1) 0%, transparent 40%)',
        }} />

        <div className="page-container" style={{ 
          position: 'relative', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            {/* Poster - Hidden on very small screens */}
            <div className="movie-hero-poster" style={{ display: 'none' /* handled by css usually, let's just show it inline for now */ }}>
              <img 
                src={posterUrl} 
                alt={movie.title} 
                style={{
                  width: '300px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            {/* Details Content */}
            <div style={{ maxWidth: '800px' }}>
              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                fontWeight: 800, 
                lineHeight: 1.1,
                marginBottom: '1rem',
                textShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                {movie.title}
              </h1>

              {movie.tagline && (
                <p style={{
                  fontSize: '1.25rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  marginBottom: '1.5rem'
                }}>
                  {movie.tagline}
                </p>
              )}

              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '1.5rem', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)' }}>
                  <Star size={18} fill="currentColor" />
                  <span style={{ fontWeight: 600, color: '#fff' }}>{movie.voteAverage.toFixed(1)}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={18} />
                  <span>{movie.releaseYear}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={18} />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {movie.genres.map(g => (
                    <span 
                      key={g.id}
                      style={{
                        padding: '2px 10px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '100px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '650px'
              }}>
                {movie.overview}
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => trailer && setIsTrailerOpen(true)}
                  disabled={!trailer}
                  style={{
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: !trailer ? 0.5 : 1,
                    cursor: !trailer ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Play size={20} fill="currentColor" />
                  {trailer ? 'Watch Trailer' : 'No Trailer Available'}
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ padding: '12px 32px', fontSize: '1.1rem' }}
                >
                  + Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {trailer && (
        <TrailerModal 
          isOpen={isTrailerOpen} 
          onClose={() => setIsTrailerOpen(false)} 
          videoKey={trailer.key} 
        />
      )}
    </>
  );
};
