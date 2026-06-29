import { useQuery } from '@tanstack/react-query';
import { movieKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../services/movie.service';

export const useTrendingMovies = (page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.trending(), page],
    queryFn: () => movieService.getTrending(page),
  });
};

export const usePopularMovies = (page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.popular(), page],
    queryFn: () => movieService.getPopular(page),
  });
};

export const useTopRatedMovies = (page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.topRated(), page],
    queryFn: () => movieService.getTopRated(page),
  });
};

export const useUpcomingMovies = (page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.upcoming(), page],
    queryFn: () => movieService.getUpcoming(page),
  });
};

export const useSearchMovies = (query: string, page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.search(query), page],
    queryFn: () => movieService.searchMovies(query, page),
    enabled: !!query,
  });
};

export const useMovieDetails = (id: number) => {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => movieService.getMovie(id),
    enabled: !!id,
  });
};

export const useMovieCredits = (id: number) => {
  return useQuery({
    queryKey: movieKeys.credits(id),
    queryFn: () => movieService.getMovieCredits(id),
    enabled: !!id,
  });
};

export const useMovieVideos = (id: number) => {
  return useQuery({
    queryKey: movieKeys.videos(id),
    queryFn: () => movieService.getMovieVideos(id),
    enabled: !!id,
  });
};

export const useSimilarMovies = (id: number, page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.similar(id), page],
    queryFn: () => movieService.getSimilarMovies(id, page),
    enabled: !!id,
  });
};

export const useMovieReviews = (id: number, page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.reviews(id), page],
    queryFn: () => movieService.getMovieReviews(id, page),
    enabled: !!id,
  });
};
