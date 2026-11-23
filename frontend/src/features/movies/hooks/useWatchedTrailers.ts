import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { movieService } from '../services/movie.service';
import type { MovieDetails } from '../types/movie.types';

const STORAGE_KEY = 'cinematch_watched_trailers';

export const getWatchedTrailerIds = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
};

export const recordWatchedTrailer = (movieId: number) => {
  if (!movieId) return;
  try {
    const current = getWatchedTrailerIds();
    const updated = [movieId, ...current.filter((id) => id !== movieId)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cinematch_trailer_watched', { detail: { movieId } }));
  } catch (err) {
    console.error('Failed to record watched trailer:', err);
  }
};

export const clearWatchedTrailers = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('cinematch_trailer_watched'));
  } catch (err) {
    console.error('Failed to clear watched trailers:', err);
  }
};

export const useWatchedTrailers = () => {
  const queryClient = useQueryClient();
  const [watchedIds, setWatchedIds] = useState<number[]>(getWatchedTrailerIds);

  useEffect(() => {
    const handler = () => {
      const ids = getWatchedTrailerIds();
      setWatchedIds(ids);
      queryClient.invalidateQueries({ queryKey: ['watched-trailers'] });
    };

    window.addEventListener('cinematch_trailer_watched', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('cinematch_trailer_watched', handler);
      window.removeEventListener('storage', handler);
    };
  }, [queryClient]);

  const { data: movies = [], isLoading } = useQuery<MovieDetails[]>({
    queryKey: ['watched-trailers', watchedIds],
    queryFn: async () => {
      if (watchedIds.length === 0) return [];
      return await movieService.getMoviesByIds(watchedIds);
    },
    enabled: watchedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const addWatchedTrailer = useCallback((id: number) => {
    recordWatchedTrailer(id);
  }, []);

  return {
    watchedIds,
    watchedMovies: movies,
    isLoading,
    addWatchedTrailer,
    clearWatchedTrailers,
  };
};
