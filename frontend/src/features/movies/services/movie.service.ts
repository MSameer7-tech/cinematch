import { tmdbClient } from '../api/client';
import { TMDB_ENDPOINTS } from '../constants/endpoints';
import { 
  mapTMDBToMovieDetails, 
  mapTMDBToPaginatedMovies,
  mapTMDBToMovieCredits,
  mapTMDBToPaginatedReviews,
  mapTMDBToVideo
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

export const movieService = {
  getTrending: async (page = 1): Promise<PaginatedMovies> => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.trending, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getPopular: async (page = 1): Promise<PaginatedMovies> => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.popular, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getTopRated: async (page = 1): Promise<PaginatedMovies> => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.topRated, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getUpcoming: async (page = 1): Promise<PaginatedMovies> => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.upcoming, {
      params: { page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  searchMovies: async (query: string, page = 1): Promise<PaginatedMovies> => {
    const raw = await tmdbClient<TMDBPaginatedResponse<TMDBMovie>>(TMDB_ENDPOINTS.search, {
      params: { query, page },
    });
    return mapTMDBToPaginatedMovies(raw);
  },

  getMovie: async (id: number): Promise<MovieDetails> => {
    const raw = await tmdbClient<TMDBMovieDetails>(TMDB_ENDPOINTS.movieDetails(id));
    return mapTMDBToMovieDetails(raw);
  },

  getMovieCredits: async (id: number): Promise<MovieCredits> => {
    const raw = await tmdbClient<TMDBCreditsResponse>(TMDB_ENDPOINTS.credits(id));
    return mapTMDBToMovieCredits(raw);
  },

  getMovieVideos: async (id: number): Promise<Video[]> => {
    const raw = await tmdbClient<{ results: TMDBVideo[] }>(TMDB_ENDPOINTS.videos(id));
    return raw.results.map(mapTMDBToVideo);
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
