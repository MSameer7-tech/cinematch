import type { FC } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  useMovieDetails, 
  useMovieCredits, 
  useMovieVideos, 
  useSimilarMovies,
  useMovieReviews
} from '../hooks/useMovies';
import { MovieHero } from '../components/details/MovieHero';
import { CastCarousel } from '../components/details/CastCarousel';
import { MovieCarousel } from '../components/carousel/MovieCarousel';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import { MovieRowSkeleton } from '../../../components/loading/MovieRowSkeleton';

export const MovieDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = id ? parseInt(id, 10) : 0;

  // Fetch all necessary data concurrently
  const { 
    data: movie, 
    isLoading: isMovieLoading, 
    isError: isMovieError 
  } = useMovieDetails(movieId);

  const { data: credits, isLoading: isCreditsLoading } = useMovieCredits(movieId);
  const { data: videos } = useMovieVideos(movieId);
  const { data: similarMovies, isLoading: isSimilarLoading } = useSimilarMovies(movieId);
  // Reviews are fetched but not yet rendered in this iteration, reserved for later
  useMovieReviews(movieId);

  if (isNaN(movieId) || movieId === 0) {
    return <Navigate to="/" replace />;
  }

  if (isMovieError) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Failed to load movie details.</h2>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      {/* Hero Section */}
      {isMovieLoading || !movie ? (
        <HeroSkeleton />
      ) : (
        <MovieHero 
          movie={movie} 
          videos={videos || []} 
        />
      )}

      <div className="page-container" style={{ marginTop: '2rem' }}>
        {/* Cast Section */}
        {isCreditsLoading ? (
          <MovieRowSkeleton />
        ) : credits?.cast && credits.cast.length > 0 ? (
          <section style={{ marginBottom: '3rem' }}>
            <h2 className="section-title">Top Cast</h2>
            <CastCarousel cast={credits.cast.slice(0, 15)} />
          </section>
        ) : null}

        {/* Similar Movies Section */}
        {isSimilarLoading ? (
          <MovieRowSkeleton />
        ) : similarMovies?.results && similarMovies.results.length > 0 ? (
          <div style={{ padding: '0 40px', margin: '40px 0' }}>
            <MovieCarousel title="More Like This" movies={similarMovies.results} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
