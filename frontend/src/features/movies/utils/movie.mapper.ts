import type { 
  TMDBMovie, 
  TMDBMovieDetails, 
  TMDBPaginatedResponse, 
  TMDBVideo,
  TMDBCastMember,
  TMDBCrewMember,
  TMDBCreditsResponse,
  TMDBReview
} from '../types/tmdb.types';
import type { 
  MovieDTO, 
  MovieDetailsDTO, 
  VideoDTO,
  CastMemberDTO,
  CrewMemberDTO,
  MovieCreditsDTO,
  ReviewDTO
} from '../dto/movie.dto';
import type { 
  Movie, 
  MovieDetails, 
  PaginatedMovies, 
  Video,
  CastMember,
  CrewMember,
  MovieCredits,
  Review
} from '../types/movie.types';

/**
 * Transforms raw TMDB snake_case data into camelCase DTOs.
 */
export const mapTMDBToMovieDTO = (raw: TMDBMovie): MovieDTO => {
  return {
    id: raw.id,
    title: raw.title,
    originalTitle: raw.original_title,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    genreIds: raw.genre_ids || [],
    releaseDate: raw.release_date || '',
    voteAverage: raw.vote_average || 0,
    voteCount: raw.vote_count || 0,
    popularity: raw.popularity || 0,
  };
};

export const mapTMDBToMovieDetailsDTO = (raw: TMDBMovieDetails): MovieDetailsDTO => {
  return {
    ...mapTMDBToMovieDTO(raw),
    budget: raw.budget,
    revenue: raw.revenue,
    runtime: raw.runtime,
    status: raw.status,
    tagline: raw.tagline,
    genres: raw.genres || [],
  };
};

export const mapTMDBToVideoDTO = (raw: TMDBVideo): VideoDTO => {
  return {
    id: raw.id,
    key: raw.key,
    name: raw.name,
    site: raw.site,
    type: raw.type,
    isOfficial: raw.official,
  };
};

export const mapTMDBToCastMemberDTO = (raw: TMDBCastMember): CastMemberDTO => {
  return {
    id: raw.id,
    name: raw.name,
    character: raw.character,
    profilePath: raw.profile_path,
  };
};

export const mapTMDBToCrewMemberDTO = (raw: TMDBCrewMember): CrewMemberDTO => {
  return {
    id: raw.id,
    name: raw.name,
    job: raw.job,
    department: raw.department,
    profilePath: raw.profile_path,
  };
};

export const mapTMDBToMovieCreditsDTO = (raw: TMDBCreditsResponse): MovieCreditsDTO => {
  return {
    cast: raw.cast.map(mapTMDBToCastMemberDTO),
    crew: raw.crew.map(mapTMDBToCrewMemberDTO),
  };
};

export const mapTMDBToReviewDTO = (raw: TMDBReview): ReviewDTO => {
  return {
    id: raw.id,
    author: raw.author,
    content: raw.content,
    rating: raw.author_details.rating,
    avatarPath: raw.author_details.avatar_path,
    createdAt: raw.created_at,
  };
};

/**
 * Transforms intermediate DTOs into strictly formatted UI Models.
 */
export const mapDTOToMovie = (dto: MovieDTO): Movie => {
  return {
    ...dto,
    // Add derived UI properties safely
    releaseYear: dto.releaseDate ? new Date(dto.releaseDate).getFullYear().toString() : 'N/A',
  };
};

export const mapDTOToMovieDetails = (dto: MovieDetailsDTO): MovieDetails => {
  return {
    ...dto,
    releaseYear: dto.releaseDate ? new Date(dto.releaseDate).getFullYear().toString() : 'N/A',
  };
};

export const mapDTOToVideo = (dto: VideoDTO): Video => {
  return {
    ...dto,
  };
};

export const mapDTOToCastMember = (dto: CastMemberDTO): CastMember => {
  return { ...dto };
};

export const mapDTOToCrewMember = (dto: CrewMemberDTO): CrewMember => {
  return { ...dto };
};

export const mapDTOToMovieCredits = (dto: MovieCreditsDTO): MovieCredits => {
  return {
    cast: dto.cast.map(mapDTOToCastMember),
    crew: dto.crew.map(mapDTOToCrewMember),
  };
};

export const mapDTOToReview = (dto: ReviewDTO): Review => {
  return { ...dto };
};

/**
 * Full Pipeline: TMDB -> UI Model
 */
export const mapTMDBToMovie = (raw: TMDBMovie): Movie => {
  return mapDTOToMovie(mapTMDBToMovieDTO(raw));
};

export const mapTMDBToMovieDetails = (raw: TMDBMovieDetails): MovieDetails => {
  return mapDTOToMovieDetails(mapTMDBToMovieDetailsDTO(raw));
};

export const mapTMDBToPaginatedMovies = (
  raw: TMDBPaginatedResponse<TMDBMovie>
): PaginatedMovies => {
  return {
    page: raw.page,
    results: raw.results.map(mapTMDBToMovie),
    totalPages: raw.total_pages,
    totalResults: raw.total_results,
  };
};

export const mapTMDBToMovieCredits = (raw: TMDBCreditsResponse): MovieCredits => {
  return mapDTOToMovieCredits(mapTMDBToMovieCreditsDTO(raw));
};

export const mapTMDBToReview = (raw: TMDBReview): Review => {
  return mapDTOToReview(mapTMDBToReviewDTO(raw));
};

export const mapTMDBToPaginatedReviews = (
  raw: TMDBPaginatedResponse<TMDBReview>
): { results: Review[]; totalResults: number; totalPages: number } => {
  return {
    results: raw.results.map(mapTMDBToReview),
    totalResults: raw.total_results,
    totalPages: raw.total_pages,
  };
};

export const mapTMDBToVideo = (raw: TMDBVideo): Video => {
  return mapDTOToVideo(mapTMDBToVideoDTO(raw));
};
