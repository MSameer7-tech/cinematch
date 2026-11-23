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

const TMDB_GENRE_NAMES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const mapTMDBToMovieDetailsDTO = (raw: TMDBMovieDetails): MovieDetailsDTO => {
  return {
    ...mapTMDBToMovieDTO(raw),
    budget: raw.budget,
    revenue: raw.revenue,
    runtime: raw.runtime,
    status: raw.status,
    tagline: raw.tagline,
    genres: (raw.genres || []).map((g) => ({
      id: g.id,
      name: (g.name && g.name.toLowerCase() !== 'general')
        ? g.name
        : (TMDB_GENRE_NAMES[g.id] || g.name || 'Drama'),
    })),
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

/**
 * Determines if a movie has already been released.
 * Excludes future release dates, unannounced dates, and unreleased statuses (e.g. Planned, In Production).
 */
export const isMovieReleased = (movie: {
  status?: string | null;
  releaseDate?: string | null;
  release_date?: string | null;
  releaseYear?: string | number | null;
} | null | undefined): boolean => {
  if (!movie) return false;

  // 1. Status check: If explicit status is given, it must be 'Released' (case-insensitive)
  if (movie.status && typeof movie.status === 'string' && movie.status.trim().length > 0) {
    if (movie.status.trim().toLowerCase() !== 'released') {
      return false;
    }
  }

  // 2. Release date check: Must not be in the future
  const rawDate = movie.releaseDate || movie.release_date;
  if (rawDate && typeof rawDate === 'string' && rawDate.trim().length > 0) {
    const timestamp = Date.parse(rawDate);
    if (!isNaN(timestamp)) {
      if (timestamp > Date.now()) {
        return false;
      }
    }
  }

  // 3. Release year check: Must not exceed current calendar year
  const currentYear = new Date().getFullYear();
  let yearNum: number | null = null;

  if (typeof movie.releaseYear === 'number' && !isNaN(movie.releaseYear)) {
    yearNum = movie.releaseYear;
  } else if (typeof movie.releaseYear === 'string' && movie.releaseYear !== 'N/A') {
    const parsed = parseInt(movie.releaseYear, 10);
    if (!isNaN(parsed)) {
      yearNum = parsed;
    }
  } else if (rawDate) {
    const parsed = parseInt(rawDate.slice(0, 4), 10);
    if (!isNaN(parsed)) {
      yearNum = parsed;
    }
  }

  if (yearNum !== null && yearNum > currentYear) {
    return false;
  }

  // If no date and no year and no released status is known, it is unreleased/unannounced
  if (!rawDate && (!movie.releaseYear || movie.releaseYear === 'N/A') && (!movie.status || movie.status.toLowerCase() !== 'released')) {
    return false;
  }

  return true;
};

export const mapTMDBToPaginatedMovies = (
  raw: TMDBPaginatedResponse<TMDBMovie>
): PaginatedMovies => {
  const released = (raw.results || []).filter(isMovieReleased);
  return {
    page: raw.page,
    results: released.map(mapTMDBToMovie),
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
