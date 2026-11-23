import { useQuery } from '@tanstack/react-query';
import { movieKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../services/movie.service';

const DEFAULT_STALE_TIME = 10 * 60 * 1000; // 10 minutes
const DEFAULT_GC_TIME = 60 * 60 * 1000;    // 1 hour

export const useTrendingMovies = (page = 1, enabled = true) => {
  return useQuery({
    queryKey: [...movieKeys.trending(), page],
    queryFn: () => movieService.getTrending(page),
    enabled,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const usePopularMovies = (page = 1, enabled = true) => {
  return useQuery({
    queryKey: [...movieKeys.popular(), page],
    queryFn: () => movieService.getPopular(page),
    enabled,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useTopRatedMovies = (page = 1, enabled = true) => {
  return useQuery({
    queryKey: [...movieKeys.topRated(), page],
    queryFn: () => movieService.getTopRated(page),
    enabled,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useUpcomingMovies = (page = 1, enabled = true) => {
  return useQuery({
    queryKey: [...movieKeys.upcoming(), page],
    queryFn: () => movieService.getUpcoming(page),
    enabled,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useSearchMovies = (query: string, page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.search(query), page],
    queryFn: () => movieService.searchMovies(query, page),
    enabled: !!query,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useMovieDetails = (id: number) => {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => movieService.getMovie(id),
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useMovieCredits = (id: number) => {
  return useQuery({
    queryKey: movieKeys.credits(id),
    queryFn: () => movieService.getMovieCredits(id),
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useMovieVideos = (id: number, title?: string) => {
  return useQuery({
    queryKey: movieKeys.videos(id),
    queryFn: () => movieService.getMovieVideos(id, title),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000,
  });
};

export const useSimilarMovies = (id: number, page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.similar(id), page],
    queryFn: () => movieService.getSimilarMovies(id, page),
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useMovieReviews = (id: number, page = 1) => {
  return useQuery({
    queryKey: [...movieKeys.reviews(id), page],
    queryFn: () => movieService.getMovieReviews(id, page),
    enabled: !!id,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

export const useMovieLogo = (id: number | undefined) => {
  return useQuery({
    queryKey: ['movie', 'logo', id],
    queryFn: async (): Promise<string | null> => {
      if (!id) return null;
      try {
        const res = await fetch(`/api/movies/${id}/logo`);
        if (res.ok) {
          const data = await res.json();
          return data?.logo_path || null;
        }
      } catch {
        // Fallback to null
      }
      return null;
    },
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  });
};
