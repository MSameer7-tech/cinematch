import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cinematch_watched_movies_meta';

export interface MovieWatchMeta {
  watched: boolean;
  progress: number; // 0 to 100 percentage
  watchedAt: number; // timestamp
}

export type WatchedMap = Record<number, MovieWatchMeta>;

export const getWatchedMap = (): WatchedMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const saveWatchedMap = (map: WatchedMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('cinematch_watched_updated'));
  } catch (err) {
    console.error('Failed to save watched map:', err);
  }
};

export const useWatchedMovies = () => {
  const [watchedMap, setWatchedMap] = useState<WatchedMap>(getWatchedMap);

  useEffect(() => {
    const handleUpdate = () => {
      setWatchedMap(getWatchedMap());
    };

    window.addEventListener('cinematch_watched_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cinematch_watched_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isWatched = useCallback(
    (movieId: number): boolean => {
      return !!watchedMap[movieId]?.watched;
    },
    [watchedMap]
  );

  const getProgress = useCallback(
    (movieId: number): number => {
      if (watchedMap[movieId]?.progress !== undefined) {
        return watchedMap[movieId].progress;
      }
      // If watched is true without explicit progress, default to 100%
      if (watchedMap[movieId]?.watched) return 100;
      return 0;
    },
    [watchedMap]
  );

  const toggleWatched = useCallback(
    (movieId: number) => {
      const current = getWatchedMap();
      const existing = current[movieId];
      const newWatched = !existing?.watched;

      const updated: WatchedMap = {
        ...current,
        [movieId]: {
          watched: newWatched,
          progress: newWatched ? 100 : 0,
          watchedAt: newWatched ? Date.now() : 0,
        },
      };

      saveWatchedMap(updated);
      setWatchedMap(updated);
    },
    []
  );

  const setProgress = useCallback(
    (movieId: number, progress: number) => {
      const current = getWatchedMap();
      const updated: WatchedMap = {
        ...current,
        [movieId]: {
          watched: progress >= 90,
          progress: Math.min(100, Math.max(0, progress)),
          watchedAt: Date.now(),
        },
      };

      saveWatchedMap(updated);
      setWatchedMap(updated);
    },
    []
  );

  return {
    watchedMap,
    isWatched,
    getProgress,
    toggleWatched,
    setProgress,
  };
};
