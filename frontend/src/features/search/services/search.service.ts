import indexService from './index.service';
import type { SearchIndexItem } from '../types/search.types';
import { movieService } from '../../movies/services/movie.service';
import type { MovieDetails } from '../../movies/types/movie.types';
import { isMovieReleased } from '../../movies/utils/movie.mapper';
import { rankingService } from './ranking.service';

let fuseInstance: any = null;

export const searchService = {
  searchLocal: async (query: string): Promise<{ item: SearchIndexItem; score: number }[]> => {
    if (!query.trim() || query.length < 2) return [];

    let bootstrap = indexService.getIndex();
    if (!bootstrap) {
      bootstrap = await indexService.preloadIndex();
    }

    if (!fuseInstance) {
      // Lazy load Fuse.js (Phase 14 / Performance)
      const Fuse = (await import('fuse.js')).default;
      fuseInstance = new Fuse(bootstrap.movies, {
        keys: [
          { name: 'title', weight: 0.40 },
          { name: 'originalTitle', weight: 0.15 },
          { name: 'cast', weight: 0.15 },
          { name: 'director', weight: 0.10 },
          { name: 'genres', weight: 0.10 },
          { name: 'keywords', weight: 0.05 },
          { name: 'alternativeTitles', weight: 0.05 }
        ],
        threshold: 0.30,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2
      });
    }

    const fuseResults = fuseInstance.search(query);
    return fuseResults.map((r: any) => ({
      item: r.item,
      // Map Fuse.js score (0 = perfect, 1 = worst) to a quality score (0.0 to 1.0)
      score: 1 - (r.score ?? 0.30)
    }));
  },

  searchTMDB: async (query: string, page = 1): Promise<MovieDetails[]> => {
    try {
      const res = await movieService.searchMovies(query, page);
      return ((res.results || []).filter(isMovieReleased) as any);
    } catch (e) {
      console.error("Failed to query TMDB Search:", e);
      return [];
    }
  },

  // Main Hybrid search orchestrator (Phase 5 & Request Cancellation)
  searchHybrid: async (
    query: string,
    userTasteProfile: any,
    page = 1,
    _signal?: AbortSignal
  ): Promise<(MovieDetails & { score?: number; reasons?: string[] })[]> => {
    if (!query.trim()) return [];

    // 1. Run Local Fuse Match & Live TMDB parallel searches with timeout protection
    const localPromise = searchService.searchLocal(query).catch((e) => {
      console.warn("searchLocal error:", e);
      return [];
    });

    const tmdbPromise = searchService.searchTMDB(query, page).catch(() => []);

    const [localResults, tmdbMovies] = await Promise.all([
      localPromise,
      Promise.race([
        tmdbPromise,
        new Promise<MovieDetails[]>((resolve) => setTimeout(() => resolve([]), 6000))
      ])
    ]);

    // 2. Hydrate local matching items with full TMDB MovieDetails
    const localMovieIds = localResults.map((r) => r.item.id);
    const hydratedLocalMovies = localMovieIds.length > 0
      ? await movieService.getMoviesByIds(localMovieIds)
      : [];
      
    const hydratedLocalMap = new Map(hydratedLocalMovies.map((m) => [m.id, m]));

    // 3. Merge & Deduplicate lists
    const mergedMap = new Map<number, { details: MovieDetails; fuseScore?: number; source: 'local' | 'tmdb' | 'hybrid' }>();

    // Add local results
    localResults.forEach((lr) => {
      const details = hydratedLocalMap.get(lr.item.id);
      if (details) {
        mergedMap.set(lr.item.id, {
          details,
          fuseScore: lr.score,
          source: 'local'
        });
      }
    });

    // Add TMDB results (marking duplicates as hybrid)
    tmdbMovies.forEach((tmdbMovie) => {
      const existing = mergedMap.get(tmdbMovie.id);
      if (existing) {
        existing.source = 'hybrid';
      } else {
        mergedMap.set(tmdbMovie.id, {
          details: tmdbMovie,
          source: 'tmdb'
        });
      }
    });

    const mergedList = Array.from(mergedMap.values());

    // 4. Filter unreleased titles and rank merged list using the personalization boost engine
    const rankedMovies = mergedList
      .filter((entry) => isMovieReleased(entry.details))
      .map((entry) => {
        const rankScore = rankingService.calculateScore(
          entry.details,
          query,
          entry.fuseScore || 0,
          userTasteProfile
        );
        return {
          ...entry.details,
          score: rankScore,
          reasons: rankingService.generateMatchReasons(entry.details, query, userTasteProfile)
        };
      });

    // Sort descending by rank score, prioritizing movies with posters
    return rankedMovies.sort((a, b) => {
      const aHasPoster = !!(a.posterPath || (a as any).poster_path);
      const bHasPoster = !!(b.posterPath || (b as any).poster_path);
      if (aHasPoster && !bHasPoster) return -1;
      if (!aHasPoster && bHasPoster) return 1;
      return (b.score || 0) - (a.score || 0);
    });
  }
};
