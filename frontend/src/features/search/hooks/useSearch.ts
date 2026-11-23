import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchStore } from '../stores/search.store';
import { searchService } from '../services/search.service';
import { analyticsService } from '../services/analytics.service';
import { useFavorites } from '../../library/hooks/useFavorites';
import { useWatchlist } from '../../library/hooks/useWatchlist';
import { useAuth } from '../../auth/hooks/useAuth';
import { isMovieReleased } from '../../movies/utils/movie.mapper';

export const useSearch = () => {
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const { data: watchlist } = useWatchlist();

  const {
    query,
    filters,
    sort,
    results,
    loading,
    setResults,
    setLoading,
    addCache,
    getCache,
    addHistory
  } = useSearchStore();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Compute local taste profile dynamically from library items for personalization (Phase 5)
  const userTasteProfile = useMemo(() => {
    const genres: string[] = [];
    const directors: string[] = [];
    const actors: string[] = [];

    const library = [...(favorites || []), ...(watchlist || [])];
    library.forEach((m: any) => {
      if (m.genres) {
        m.genres.forEach((g: any) => genres.push(typeof g === 'string' ? g : g.name));
      }
      if (m.director) {
        directors.push(m.director);
      }
      if (m.cast) {
        actors.push(...m.cast.slice(0, 3));
      }
    });

    return {
      favoriteGenres: Array.from(new Set(genres)),
      favoriteDirectors: Array.from(new Set(directors)),
      favoriteActors: Array.from(new Set(actors)),
    };
  }, [favorites, watchlist]);

  // Execute Search Pipeline
  const executeSearch = async (currentQuery: string, currentPage = 1, append = false) => {
    if (!currentQuery.trim() && currentPage === 1) {
      setResults([]);
      setHasMore(false);
      return;
    }

    // Cancel any stale active search requests (Phase 14 / Performance)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      // 1. Check Query Cache First (Phase 12)
      const cached = getCache(currentQuery, filters, sort, currentPage);
      if (cached) {
        if (append) {
          setResults([...results, ...cached]);
        } else {
          setResults(cached);
        }
        setHasMore(cached.length >= 20);
        setLoading(false);
        return;
      }

      const startTime = Date.now();
      
      // 2. Query Hybrid Search (Fuzzy Local + Live TMDB)
      let list = await searchService.searchHybrid(currentQuery, userTasteProfile, currentPage, controller.signal);

      // Check if this request was aborted before proceeding
      if (controller.signal.aborted) return;

      // 3. Apply Sort Order (Phase 10)
      if (sort === 'popularity') {
        list = [...list].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      } else if (sort === 'rating') {
        list = [...list].sort((a, b) => ((b.voteAverage ?? (b as any).vote_average) || 0) - ((a.voteAverage ?? (a as any).vote_average) || 0));
      } else if (sort === 'newest') {
        list = [...list].sort((a, b) => parseInt(b.releaseYear || '0') - parseInt(a.releaseYear || '0'));
      } else if (sort === 'oldest') {
        list = [...list].sort((a, b) => parseInt(a.releaseYear || '0') - parseInt(b.releaseYear || '0'));
      } else if (sort === 'alphabetical') {
        list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }

      // 4. Apply Filters (Phase 10)
      let filtered = list.filter(isMovieReleased);
      
      if (filters.genres && filters.genres.length > 0) {
        filtered = filtered.filter((movie) => 
          movie.genres?.some((g) => filters.genres.includes(g.name))
        );
      }

      if (filters.yearMin) {
        filtered = filtered.filter((m) => parseInt(m.releaseYear || '0') >= (filters.yearMin || 0));
      }
      if (filters.yearMax) {
        filtered = filtered.filter((m) => parseInt(m.releaseYear || '0') <= (filters.yearMax || 9999));
      }

      if (filters.runtimeMin) {
        filtered = filtered.filter((m) => (m.runtime || 0) >= (filters.runtimeMin || 0));
      }
      if (filters.runtimeMax) {
        filtered = filtered.filter((m) => (m.runtime || 0) <= (filters.runtimeMax || 999));
      }

      if (filters.language) {
        filtered = filtered.filter((m) => (m as any).language === filters.language || (m as any).originalLanguage === filters.language);
      }

      if (filters.ratingMin) {
        filtered = filtered.filter((m) => ((m.voteAverage ?? (m as any).vote_average) || 0) >= (filters.ratingMin || 0));
      }

      // 5. Store Cache & History
      addCache(currentQuery, filters, sort, currentPage, filtered);
      
      if (currentPage === 1) {
        addHistory(currentQuery);
        if (user?.id) {
          const responseTime = Date.now() - startTime;
          analyticsService.logSearchSubmitted(user.id, currentQuery, filtered.length);
        }
      }

      // 6. Update results
      if (append) {
        setResults([...results, ...filtered]);
      } else {
        setResults(filtered);
      }

      setHasMore(filtered.length >= 20);
    } catch (e) {
      console.error("Search Pipeline Execution Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Re-trigger search when query, filters, or sort changes
  useEffect(() => {
    setPage(1);
    executeSearch(query, 1, false);
  }, [query, filters, sort]);

  const loadNextPage = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(query, nextPage, true);
  };

  return {
    query,
    filters,
    sort,
    results,
    loading,
    hasMore,
    loadNextPage,
    executeSearch,
    userTasteProfile
  };
};
export default useSearch;
