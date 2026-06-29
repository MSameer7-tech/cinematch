/**
 * Data Transfer Objects (DTO)
 * 
 * If we ever aggregate data from multiple APIs or a backend in the future,
 * these DTOs provide a flexible intermediate contract.
 */

export interface MovieDTO {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  genreIds: number[];
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
}

export interface MovieDetailsDTO extends MovieDTO {
  budget: number;
  revenue: number;
  runtime: number | null;
  status: string;
  tagline: string | null;
  genres: Array<{ id: number; name: string }>;
}

export interface VideoDTO {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  isOfficial: boolean;
}

export interface PaginatedMoviesDTO {
  page: number;
  results: MovieDTO[];
  totalPages: number;
  totalResults: number;
}

export interface CastMemberDTO {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface CrewMemberDTO {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}

export interface MovieCreditsDTO {
  cast: CastMemberDTO[];
  crew: CrewMemberDTO[];
}

export interface ReviewDTO {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  avatarPath: string | null;
  createdAt: string;
}
