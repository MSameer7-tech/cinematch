import type { FC } from 'react';
import { useState } from 'react';
import { Star, Clock, Calendar, Play, Film, CheckCircle2 } from 'lucide-react';
import type { MovieDetails, Video } from '../../types/movie.types';
import { getBackdropUrl, getPosterUrl } from '../../utils/image';
import { TrailerModal } from './TrailerModal';
import { RatingDialog } from '../../../library/components/RatingDialog';
import { MovieActions } from '../../../library/components/MovieActions';
import { useRatings } from '../../../library/hooks/useRatings';

interface MovieHeroProps {
  movie: MovieDetails;
  videos: Video[];
  directorName?: string;
}

export const MovieHero: FC<MovieHeroProps> = ({ movie, videos, directorName }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const { data: ratings } = useRatings();
  const existingRating = ratings?.find(r => r.media_id === movie.id);

  // Find an official YouTube trailer
  const trailer = videos.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.find(
    (v) => v.site === 'YouTube'
  );

  const backdropUrl = getBackdropUrl(movie.backdropPath, 'original') || getBackdropUrl(movie.backdropPath, 'w1280');
  const posterUrl = getPosterUrl(movie.posterPath, 'w500');

  // Format runtime
  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Format vote count
  const formatVoteCount = (count: number) => {
    if (!count) return '';
    if (count >= 1000) return `(${(count / 1000).toFixed(1)}k)`;
    return `(${count})`;
  };

  return (
    <>
      <div 
        className="movie-hero-wrapper"
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
        }}
      >
        {/* Gradient Overlays */}
        <div className="movie-hero-backdrop-overlay" />

        <div className="movie-hero-content">
          {/* Floating Poster Card */}
          {posterUrl && (
            <div className="movie-poster-card">
              <img 
                src={posterUrl} 
                alt={movie.title} 
                loading="eager"
              />
            </div>
          )}

          {/* Details Content */}
          <div className="movie-hero-info">
            {/* Title */}
            <h1 className="movie-title-heading">
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="movie-tagline-text">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Director Credit if available */}
            {directorName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontSize: '14.5px', fontWeight: 600 }}>
                <Film size={16} />
                <span>Directed by {directorName}</span>
              </div>
            )}

            {/* Metadata Badges Row */}
            <div className="movie-meta-row">
              {/* TMDB Rating */}
              <div className="meta-badge meta-badge-rating">
                <Star size={15} fill="currentColor" />
                <span>{movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : 'NR'}</span>
                {movie.voteCount > 0 && (
                  <span style={{ fontSize: '11.5px', opacity: 0.85, fontWeight: 500 }}>
                    {formatVoteCount(movie.voteCount)}
                  </span>
                )}
              </div>
              
              {/* Year */}
              <div className="meta-badge">
                <Calendar size={14} color="#94a3b8" />
                <span>{movie.releaseYear || 'N/A'}</span>
              </div>
              
              {/* Runtime */}
              <div className="meta-badge">
                <Clock size={14} color="#94a3b8" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>

              {/* Status */}
              {movie.status && (
                <div className="meta-badge" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                  <CheckCircle2 size={13} />
                  <span>{movie.status}</span>
                </div>
              )}

              {/* Genres */}
              {movie.genres && movie.genres.map(g => (
                <span 
                  key={g.id}
                  className="meta-badge meta-badge-genre"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Synopsis Overview */}
            {movie.overview && (
              <p className="movie-overview-text">
                {movie.overview}
              </p>
            )}

            {/* Action Buttons Row */}
            <div className="movie-actions-row">
              {/* Watch Trailer */}
              <button 
                className="btn-trailer-premium"
                onClick={() => trailer && setIsTrailerOpen(true)}
                disabled={!trailer}
                title={trailer ? 'Watch official trailer' : 'No trailer available'}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Play size={13} fill="#ffffff" style={{ marginLeft: '2px' }} />
                </div>
                <span>{trailer ? 'Watch Trailer' : 'No Trailer Available'}</span>
              </button>

              {/* Rate Movie */}
              <button 
                className="btn-rate-premium"
                onClick={() => setIsRatingOpen(true)}
                title="Rate this movie"
              >
                <Star size={16} fill="currentColor" />
                <span>
                  {existingRating ? `Rated ${existingRating.rating}/10` : 'Rate Movie'}
                </span>
              </button>

              {/* Watchlist, Favorite, Share Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MovieActions movieId={movie.id} showInfo={false} size="large" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RatingDialog
        movieId={movie.id}
        movieTitle={movie.title}
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
      />

      {trailer && (
        <TrailerModal 
          isOpen={isTrailerOpen} 
          onClose={() => setIsTrailerOpen(false)} 
          videoKey={trailer.key}
          movieId={movie.id}
          movieTitle={movie.title}
        />
      )}
    </>
  );
};
