import type { FC } from 'react';
import { MovieCarousel } from './MovieCarousel';
import { MovieRowSkeleton } from '../../../../components/loading/MovieRowSkeleton';
import { NetworkError } from '../../../../components/errors/NetworkError';
import type { PaginatedMovies } from '../../types/movie.types';

interface MovieSectionProps {
  title: string;
  queryHook: () => {
    data: PaginatedMovies | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
}

export const MovieSection: FC<MovieSectionProps> = ({ title, queryHook }) => {
  const { data, isLoading, isError, refetch } = queryHook();

  if (isLoading) return <MovieRowSkeleton />;

  if (isError) {
    return (
      <div style={{ padding: '0 40px', margin: '40px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>{title}</h2>
        <NetworkError onRetry={() => refetch()} />
      </div>
    );
  }

  if (!data?.results?.length) return null;

  return <MovieCarousel title={title} movies={data.results} />;
};
