import type { FC } from 'react';
import { useQueries } from '@tanstack/react-query';
import { movieKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../../movies/services/movie.service';
import { MovieCarousel } from '../../movies/components/carousel/MovieCarousel';

interface LibraryCarouselProps {
  title: string;
  movieIds: number[];
  emptyMessage?: string;
}

export const LibraryCarousel: FC<LibraryCarouselProps> = ({ 
  title, 
  movieIds,
  emptyMessage = '🍿 Watch a movie and it\'ll appear here.'
}) => {
  // Use useQueries to fetch all movies in parallel
  const queries = useQueries({
    queries: movieIds.map((id) => ({
      queryKey: movieKeys.detail(id),
      queryFn: () => movieService.getMovie(id),
      staleTime: 1000 * 60 * 60, // 1 hour (movies don't change often)
    })),
  });

  const isLoading = queries.some(q => q.isLoading);
  const movies = queries
    .map(q => q.data)
    .filter((movie): movie is NonNullable<typeof movie> => movie !== undefined);

  if (!isLoading && movies.length === 0) {
    return (
      <div style={{ padding: '0 40px', margin: '40px 0' }}>
        <h2 className="section-title">{title}</h2>
        <div style={{
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '16px',
        }}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  // We can pass the movies to the existing MovieCarousel
  return (
    <div style={{ padding: '0 40px', margin: '40px 0' }}>
      {/* 
        We pass empty string as title to MovieCarousel because it doesn't handle empty state well 
        or we just let MovieCarousel render its own title 
      */}
      <MovieCarousel title={title} movies={movies} />
    </div>
  );
};
