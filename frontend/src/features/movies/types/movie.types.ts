/**
 * Internal Application Movie Types
 * 
 * These interfaces represent the clean, sanitized data models used by the UI.
 * They guarantee camelCase properties and strict type safety across components.
 */

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  genreIds: number[];
  releaseDate: string;
  releaseYear: string; // Extracted from releaseDate for UI convenience
  voteAverage: number;
  voteCount: number;
  popularity: number;
}

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number | null;
  status: string;
  tagline: string | null;
  genres: Genre[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  isOfficial: boolean;
}

export interface PaginatedMovies {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}

export interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  avatarPath: string | null;
  createdAt: string;
}
