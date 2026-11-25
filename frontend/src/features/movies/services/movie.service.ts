import { tmdbClient } from '../api/client';
import { TMDB_ENDPOINTS } from '../constants/endpoints';
import { 
  mapTMDBToMovieDetails, 
  mapTMDBToPaginatedMovies,
  mapTMDBToMovieCredits,
  mapTMDBToPaginatedReviews,
  mapTMDBToVideo,
  isMovieReleased
} from '../utils/movie.mapper';
import type { 
  TMDBMovie, 
  TMDBMovieDetails, 
  TMDBPaginatedResponse,
  TMDBCreditsResponse,
  TMDBReview,
  TMDBVideo
} from '../types/tmdb.types';
import type { 
  MovieDetails, 
  PaginatedMovies,
  MovieCredits,
  Video
} from '../types/movie.types';
/**
 * Movie Service Layer
 * Orchestrates API requests and maps raw responses into strict UI models.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

// In-memory cache to make page transitions and duplicate movie lookups instant (0ms)
const movieMemoryCache = new Map<number, MovieDetails>();

export const movieService = {
  getTrending: async (page = 1): Promise<PaginatedMovies> => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/trending?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        return mapTMDBToPaginatedMovies(data);
      }
    } catch (e) {
      console.warn("Live trending fetch failed, trying local section fallback:", e);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/homepage/sections/trending?user_id=anonymous&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const movieIds = (data.movies || []).map((m: any) => m.id);
        const details = (await movieService.getMoviesByIds(movieIds)).filter(isMovieReleased);
        return {
          page: data.page || page,
          results: details,
          totalPages: Math.ceil((data.totalMovies || 100) / (data.pageSize || 20)),
          totalResults: data.totalMovies || 100,
        };
      }
    } catch (e) {
      console.warn("Local trending fetch failed, trying TMDB fallback:", e);
    }
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.trending, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getPopular: async (page = 1): Promise<PaginatedMovies> => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/popular?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        return mapTMDBToPaginatedMovies(data);
      }
    } catch (e) {
      console.warn("Live popular fetch failed, trying local section fallback:", e);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/homepage/sections/trending?user_id=anonymous&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const movieIds = (data.movies || []).map((m: any) => m.id);
        const details = (await movieService.getMoviesByIds(movieIds)).filter(isMovieReleased);
        return {
          page: data.page || page,
          results: details,
          totalPages: Math.ceil((data.totalMovies || 100) / (data.pageSize || 20)),
          totalResults: data.totalMovies || 100,
        };
      }
    } catch (e) {
      console.warn("Local popular fetch failed, trying TMDB fallback:", e);
    }
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.popular, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getTopRated: async (page = 1): Promise<PaginatedMovies> => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/top_rated?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        return mapTMDBToPaginatedMovies(data);
      }
    } catch (e) {
      console.warn("Live top_rated fetch failed, trying local section fallback:", e);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/homepage/sections/hidden_gems?user_id=anonymous&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const movieIds = (data.movies || []).map((m: any) => m.id);
        const details = (await movieService.getMoviesByIds(movieIds)).filter(isMovieReleased);
        return {
          page: data.page || page,
          results: details,
          totalPages: Math.ceil((data.totalMovies || 100) / (data.pageSize || 20)),
          totalResults: data.totalMovies || 100,
        };
      }
    } catch (e) {
      console.warn("Local topRated fetch failed, trying TMDB fallback:", e);
    }
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.topRated, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getUpcoming: async (page = 1): Promise<PaginatedMovies> => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/new_releases?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        return mapTMDBToPaginatedMovies(data);
      }
    } catch (e) {
      console.warn("Live new_releases fetch failed, trying local section fallback:", e);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/homepage/sections/new_releases?user_id=anonymous&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const movieIds = (data.movies || []).map((m: any) => m.id);
        const details = (await movieService.getMoviesByIds(movieIds)).filter(isMovieReleased);
        return {
          page: data.page || page,
          results: details,
          totalPages: Math.ceil((data.totalMovies || 100) / (data.pageSize || 20)),
          totalResults: data.totalMovies || 100,
        };
      }
    } catch (e) {
      console.warn("Local upcoming fetch failed, trying TMDB fallback:", e);
    }
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.upcoming, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  discoverMovies: async (params: {
    page?: number;
    genreId?: number;
    category?: string;
    mediaType?: string;
    region?: string;
    includeMature?: boolean;
  } = {}): Promise<PaginatedMovies> => {
    const {
      page = 1,
      genreId = 0,
      category = 'popular',
      mediaType = 'movie',
      region = 'all',
      includeMature = true,
    } = params;
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        category,
        media_type: mediaType,
        region,
        include_mature: String(includeMature),
      });
      if (genreId > 0) {
        queryParams.set('genre_id', String(genreId));
      }
      const res = await fetch(`${API_BASE_URL}/movies/discover?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return mapTMDBToPaginatedMovies(data);
      }
    } catch (e) {
      console.warn("Backend discover failed, trying TMDB fallback:", e);
    }
    try {
      const sortMap: Record<string, string> = {
        popular: 'popularity.desc',
        trending: 'popularity.desc',
        topRated: 'vote_average.desc',
        upcoming: 'primary_release_date.desc',
      };
      const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', {
        params: {
          page,
          sort_by: sortMap[category] || 'popularity.desc',
          ...(genreId > 0 ? { with_genres: genreId } : {}),
        },
      });
      return mapTMDBToPaginatedMovies(raw);
    } catch {
      return { page, results: [], totalPages: 0, totalResults: 0 };
    }
  },

  searchMovies: async (query: string, page = 1): Promise<PaginatedMovies> => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        return mapTMDBToPaginatedMovies(data);
      }
    } catch (e) {
      console.warn("Backend search failed, trying TMDB fallback:", e);
    }
    try {
      const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.search, {
        params: { query, page },
      });
      return mapTMDBToPaginatedMovies(raw);
    } catch {
      return { page, results: [], totalPages: 0, totalResults: 0 };
    }
  },

  getMovie: async (id: number): Promise<MovieDetails> => {
    const cached = movieMemoryCache.get(id);
    if (cached) return cached;

    try {
      const res = await fetch(`${API_BASE_URL}/movies/${id}`);
      if (res.ok) {
        const raw = await res.json();
        const details = mapTMDBToMovieDetails(raw);
        movieMemoryCache.set(id, details);
        return details;
      }
    } catch {
      // fallback to tmdbClient
    }
    const raw = await tmdbClient<TMDBMovieDetails>(TMDB_ENDPOINTS.movieDetails(id));
    const details = mapTMDBToMovieDetails(raw);
    movieMemoryCache.set(id, details);
    return details;
  },

  getMoviesByIds: async (ids: number[]): Promise<MovieDetails[]> => {
    if (!ids || ids.length === 0) return [];
    
    // Check in-memory cache first
    const missingIds: number[] = [];
    const resultMap = new Map<number, MovieDetails>();

    for (const id of ids) {
      const cached = movieMemoryCache.get(id);
      if (cached) {
        resultMap.set(id, cached);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      try {
        const CHUNK_SIZE = 100;
        const chunks: number[][] = [];
        for (let i = 0; i < missingIds.length; i += CHUNK_SIZE) {
          chunks.push(missingIds.slice(i, i + CHUNK_SIZE));
        }

        const chunkResponses = await Promise.all(
          chunks.map(async (chunk) => {
            const res = await fetch(`${API_BASE_URL}/movies/batch`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ movie_ids: chunk }),
            });
            return res.ok ? (await res.json() as Record<string, any>) : {};
          })
        );

        for (const batchMap of chunkResponses) {
          for (const [idStr, raw] of Object.entries(batchMap)) {
            const id = Number(idStr);
            if (raw) {
              try {
                const details = mapTMDBToMovieDetails(raw);
                movieMemoryCache.set(id, details);
                resultMap.set(id, details);
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } catch (err) {
        console.warn('Batch fetch error:', err);
      }

      // Check if any IDs are still missing after batch
      const stillMissing = missingIds.filter(id => !resultMap.has(id));
      if (stillMissing.length > 0) {
        // Fast parallel fetch with 1s timeout race
        const fetchPromises = stillMissing.slice(0, 20).map(async (id) => {
          try {
            const detail = await Promise.race([
              movieService.getMovie(id),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
            ]);
            if (detail) {
              resultMap.set(id, detail);
            }
          } catch {
            // Ignore individual fetch failure
          }
        });
        await Promise.allSettled(fetchPromises);
      }
    }

    // Return in requested order
    const orderedList: MovieDetails[] = [];
    for (const id of ids) {
      const m = resultMap.get(id);
      if (m) {
        orderedList.push(m);
      }
    }
    return orderedList;
  },

  getMovieCredits: async (id: number): Promise<MovieCredits> => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${id}/credits`);
      if (res.ok) {
        const raw = await res.json();
        if (raw && (raw.cast || raw.crew)) {
          return mapTMDBToMovieCredits(raw);
        }
      }
    } catch {
      // fallback
    }
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${id}`);
      if (res.ok) {
        const raw = await res.json();
        if (raw.credits) {
          return mapTMDBToMovieCredits(raw.credits);
        }
      }
    } catch {
      // fallback
    }
    const raw = await tmdbClient<TMDBCreditsResponse>(TMDB_ENDPOINTS.credits(id));
    return mapTMDBToMovieCredits(raw);
  },

  getMovieVideos: async (id: number, title?: string): Promise<Video[]> => {
    // 1. Primary: Fast backend live & cached endpoint (with 8s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const url = title 
        ? `${API_BASE_URL}/movies/${id}/videos?title=${encodeURIComponent(title)}`
        : `${API_BASE_URL}/movies/${id}/videos`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const raw = await res.json();
        if (raw.results && Array.isArray(raw.results) && raw.results.length > 0) {
          return raw.results.map(mapTMDBToVideo);
        }
      }
    } catch (e) {
      console.warn("Backend video fetch failed, trying detail fallback:", e);
    }

    // 2. Secondary: Backend movie details with embedded videos
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE_URL}/movies/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const raw = await res.json();
        if (raw.videos?.results && Array.isArray(raw.videos.results) && raw.videos.results.length > 0) {
          return raw.videos.results.map(mapTMDBToVideo);
        }
      }
    } catch {
      // fallback
    }

    return [];
  },

  getSimilarMovies: async (id: number, page = 1): Promise<PaginatedMovies> => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.similar(id), {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getMovieReviews: async (id: number, page = 1) => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBReview>>(TMDB_ENDPOINTS.reviews(id), {
      params: { page },
    });
    return mapTMDBToPaginatedReviews(raw);
  },
};
