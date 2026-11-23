import type { MovieDetails } from '../../movies/types/movie.types';

export interface SearchIndexItem {
  id: number;
  title: string;
  originalTitle: string;
  alternativeTitles: string[];
  genres: string[];
  cast: string[];
  director?: string | null;
  keywords: string[];
  popularity: number;
  voteCount: number;
  voteAverage: number;
  releaseYear: number;
  language: string;
  runtime?: number | null;
  productionCountries: string[];
  adult: boolean;
  mediaType: string;
}

export interface SearchBootstrapPayload {
  movies: SearchIndexItem[];
  genres: string[];
  languages: string[];
  years: number[];
}

export interface FilterParameters {
  contentType: 'movie' | 'tv' | 'both';
  genres: string[];
  yearMin?: number | null;
  yearMax?: number | null;
  runtimeMin?: number | null;
  runtimeMax?: number | null;
  language?: string | null;
  country?: string | null;
  ratingMin?: number | null;
}

export type SortOption = 
  | 'relevance' 
  | 'popularity' 
  | 'rating' 
  | 'newest' 
  | 'oldest' 
  | 'alphabetical';

export interface RecentSearch {
  query: string;
  timestamp: string;
}

export interface SearchCacheItem {
  query: string;
  filters: FilterParameters;
  sort: SortOption;
  page: number;
  results: (MovieDetails & { score?: number; reasons?: string[] })[];
  timestamp: number; // epoch
}

export interface AISearchStructuredFilters {
  type: 'filter' | 'recommendation';
  genres: string[];
  runtimeMax?: number | null;
  ratingMin?: number | null;
  keywords: string[];
  language?: string | null;
  yearMin?: number | null;
  yearMax?: number | null;
  seedMovies: string[];
  mood?: string | null;
}

export interface SearchAnalyticsEvent {
  query: string;
  movieId?: number;
  position?: number;
  responseTimeMs?: number;
  source?: 'local' | 'tmdb' | 'hybrid';
  timestamp: string;
  action: 
    | 'typed'
    | 'suggestion_opened'
    | 'suggestion_clicked'
    | 'submitted'
    | 'clicked'
    | 'scrolled'
    | 'watchlisted'
    | 'favorited'
    | 'rated'
    | 'shared';
}
