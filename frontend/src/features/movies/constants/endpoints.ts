/**
 * TMDB API Endpoints
 */

export const TMDB_ENDPOINTS = {
  trending: '/trending/movie/day',
  popular: '/movie/popular',
  topRated: '/movie/top_rated',
  upcoming: '/movie/upcoming',
  nowPlaying: '/movie/now_playing',
  search: '/search/movie',
  movieDetails: (id: number) => `/movie/${id}`,
  recommendations: (id: number) => `/movie/${id}/recommendations`,
  similar: (id: number) => `/movie/${id}/similar`,
  videos: (id: number) => `/movie/${id}/videos`,
  credits: (id: number) => `/movie/${id}/credits`,
  reviews: (id: number) => `/movie/${id}/reviews`,
  genres: '/genre/movie/list',
} as const;
