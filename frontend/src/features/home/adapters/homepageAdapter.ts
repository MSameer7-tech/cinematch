import type { MovieDetails } from '../../movies/types/movie.types';
import { movieService } from '../../movies/services/movie.service';
import { isMovieReleased } from '../../movies/utils/movie.mapper';

export interface BackendMoviePlaceholder {
  id: number;
  score?: number;
  reasons?: string[];
  persona_badge?: string;
}

export interface BackendHomepageSection {
  id: string;
  title: string;
  subtitle?: string | null;
  section_type: string;
  priority: number;
  strategy: string;
  page: number;
  pageSize: number;
  totalMovies: number;
  hasMore: boolean;
  nextPage?: number | null;
  movies: BackendMoviePlaceholder[];
}

export interface BackendHomepageResponse {
  hero: BackendMoviePlaceholder | null;
  hero_movies?: BackendMoviePlaceholder[];
  persona_title?: string | null;
  sections: BackendHomepageSection[];
  generated_at: string;
  cache_until: string;
  version: string;
  request_id: string;
}

export interface HydratedHomepageSection {
  id: string;
  title: string;
  subtitle?: string | null;
  section_type: string;
  priority: number;
  strategy: string;
  page: number;
  pageSize: number;
  totalMovies: number;
  hasMore: boolean;
  nextPage?: number | null;
  movies: (MovieDetails & { score?: number; reasons?: string[]; persona_badge?: string })[];
}

export interface HydratedHomepageResponse {
  hero: (MovieDetails & { score?: number; reasons?: string[]; persona_badge?: string }) | null;
  hero_movies?: (MovieDetails & { score?: number; reasons?: string[]; persona_badge?: string })[];
  persona_title?: string | null;
  sections: HydratedHomepageSection[];
  generated_at: string;
  cache_until: string;
  version: string;
  request_id: string;
}

export interface BackendSectionPage {
  movies: BackendMoviePlaceholder[];
  page: number;
  pageSize: number;
  totalMovies: number;
  hasMore: boolean;
  nextPage?: number | null;
  customTitle?: string | null;
}

export interface HydratedSectionPage {
  movies: (MovieDetails & { score?: number; reasons?: string[] })[];
  page: number;
  pageSize: number;
  totalMovies: number;
  hasMore: boolean;
  nextPage?: number | null;
  customTitle?: string | null;
}

/**
 * 1. Normalizer: Standardizes raw backend response format (with Validation safety layer)
 */
export const normalizeHomepage = (raw: any): BackendHomepageResponse => {
  if (!raw || typeof raw !== 'object') {
    console.error("Validation Safety Error: Homepage raw payload is null or not an object");
    return {
      hero: null,
      sections: [],
      generated_at: new Date().toISOString(),
      cache_until: new Date().toISOString(),
      version: 'v1',
      request_id: ''
    };
  }

  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const sections = rawSections
    .map((s: any) => {
      if (!s || typeof s !== 'object' || !s.id || !s.title) {
        console.warn("Validation Safety Warning: Discarded invalid section:", s);
        return null;
      }
      return {
        id: String(s.id),
        title: String(s.title),
        subtitle: s.subtitle ? String(s.subtitle) : null,
        section_type: String(s.sectionType || s.section_type || 'static'),
        priority: Number(s.priority || 99),
        strategy: String(s.strategy || s.id),
        page: Number(s.page || 1),
        pageSize: Number(s.pageSize || 20),
        totalMovies: Number(s.totalMovies || s.total_movies || 0),
        hasMore: Boolean(s.hasMore || s.has_more),
        nextPage: s.nextPage !== undefined ? s.nextPage : (s.next_page !== undefined ? s.next_page : null),
        movies: (s.movies || []).map((m: any) => {
          if (!m || typeof m !== 'object' || !m.id) {
            console.warn("Validation Safety Warning: Discarded invalid movie placeholder:", m);
            return null;
          }
          return {
            id: Number(m.id),
            score: m.score ? Number(m.score) : undefined,
            reasons: m.reasons || undefined,
            persona_badge: m.persona_badge || m.personaBadge || undefined,
          };
        }).filter((m): m is BackendMoviePlaceholder => !!m),
      };
    })
    .filter((s): s is BackendHomepageSection => !!s);

  const heroMoviesRaw = Array.isArray(raw.hero_movies || raw.heroMovies)
    ? (raw.hero_movies || raw.heroMovies)
        .map((m: any) => {
          if (!m || typeof m !== 'object' || !m.id) return null;
          return {
            id: Number(m.id),
            score: m.score ? Number(m.score) : undefined,
            reasons: m.reasons || undefined,
            persona_badge: m.persona_badge || m.personaBadge || undefined,
          };
        })
        .filter((m: any): m is BackendMoviePlaceholder => !!m)
    : [];

  return {
    hero: raw.hero && raw.hero.id
      ? {
          id: Number(raw.hero.id),
          score: raw.hero.score ? Number(raw.hero.score) : undefined,
          reasons: raw.hero.reasons || undefined,
          persona_badge: raw.hero.persona_badge || raw.hero.personaBadge || undefined,
        }
      : null,
    hero_movies: heroMoviesRaw,
    persona_title: raw.persona_title || raw.personaTitle || null,
    sections,
    generated_at: String(raw.generated_at || new Date().toISOString()),
    cache_until: String(raw.cache_until || new Date().toISOString()),
    version: String(raw.version || 'v1'),
    request_id: String(raw.request_id || ''),
  };
};

/**
 * 2. Hydrator: Collects unique movie IDs and fetches details from TMDB
 */
export const hydrateMovieIds = async (
  normalized: BackendHomepageResponse
): Promise<Map<number, MovieDetails>> => {
  const uniqueIds = new Set<number>();
  
  if (normalized.hero) {
    uniqueIds.add(normalized.hero.id);
  }

  if (normalized.hero_movies) {
    for (const hm of normalized.hero_movies) {
      uniqueIds.add(hm.id);
    }
  }
  
  for (const section of normalized.sections) {
    for (const movie of section.movies) {
      uniqueIds.add(movie.id);
    }
  }

  const idList = Array.from(uniqueIds);
  if (idList.length === 0) {
    return new Map();
  }

  const movieDetailsList = await movieService.getMoviesByIds(idList);
  return new Map(movieDetailsList.map((m) => [m.id, m]));
};

/**
 * 3. Adapter: Merges structural sections with hydrated TMDB details
 */
export const adaptHomepage = (
  normalized: BackendHomepageResponse,
  hydratedMovies: Map<number, MovieDetails>
): HydratedHomepageResponse => {
  let heroMovie: (MovieDetails & { score?: number; reasons?: string[]; persona_badge?: string }) | null = null;
  if (normalized.hero) {
    const details = hydratedMovies.get(normalized.hero.id);
    if (details && isMovieReleased(details)) {
      heroMovie = {
        ...details,
        score: normalized.hero.score,
        reasons: normalized.hero.reasons,
        persona_badge: normalized.hero.persona_badge,
      };
    }
  }

  // Hydrate taste-recommended hero movies
  const heroMovies: (MovieDetails & { score?: number; reasons?: string[]; persona_badge?: string })[] = [];
  if (normalized.hero_movies && normalized.hero_movies.length > 0) {
    for (const hm of normalized.hero_movies) {
      const details = hydratedMovies.get(hm.id);
      if (details && isMovieReleased(details)) {
        heroMovies.push({
          ...details,
          score: hm.score,
          reasons: hm.reasons,
          persona_badge: hm.persona_badge,
        });
      }
    }
  }

  const sections: HydratedHomepageSection[] = normalized.sections.map((section) => {
    const movies = section.movies
      .map((m) => {
        const details = hydratedMovies.get(m.id);
        if (details && isMovieReleased(details)) {
          return {
            ...details,
            score: m.score,
            reasons: m.reasons,
            persona_badge: m.persona_badge,
          };
        }
        return null;
      })
      .filter((m): m is MovieDetails & { score?: number; reasons?: string[]; persona_badge?: string } => m !== null);

    return {
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      section_type: section.section_type,
      priority: section.priority,
      strategy: section.strategy,
      page: section.page,
      pageSize: section.pageSize,
      totalMovies: section.totalMovies,
      hasMore: section.hasMore,
      nextPage: section.nextPage,
      movies,
    };
  });

  if (!heroMovie) {
    if (heroMovies.length > 0) {
      heroMovie = heroMovies[0];
    } else {
      for (const sec of sections) {
        const releasedMovie = sec.movies.find(isMovieReleased);
        if (releasedMovie) {
          heroMovie = releasedMovie;
          break;
        }
      }
    }
  }

  return {
    hero: heroMovie,
    hero_movies: heroMovies,
    persona_title: normalized.persona_title,
    sections,
    generated_at: normalized.generated_at,
    cache_until: normalized.cache_until,
    version: normalized.version,
    request_id: normalized.request_id,
  };
};

/**
 * Pipeline helper combining Normalizer -> Hydrator -> Adapter for the homepage
 */
export const processHomepageResponse = async (raw: any): Promise<HydratedHomepageResponse> => {
  const normalized = normalizeHomepage(raw);
  const movieMap = await hydrateMovieIds(normalized);
  return adaptHomepage(normalized, movieMap);
};

/**
 * Normalizer: Standardizes raw SectionPage backend response format (with validation checks)
 */
export const normalizeSectionPage = (raw: any): BackendSectionPage => {
  if (!raw || typeof raw !== 'object') {
    console.error("Validation Safety Error: SectionPage raw payload is null or not an object");
    return {
      movies: [],
      page: 1,
      pageSize: 20,
      totalMovies: 0,
      hasMore: false,
      nextPage: null,
      customTitle: null
    };
  }

  const rawMovies = Array.isArray(raw.movies) ? raw.movies : [];
  const movies = rawMovies
    .map((m: any) => {
      if (!m || typeof m !== 'object' || !m.id) {
        console.warn("Validation Safety Warning: Discarded invalid section page movie entry:", m);
        return null;
      }
      return {
        id: Number(m.id),
        score: m.score ? Number(m.score) : undefined,
        reasons: m.reasons || undefined,
      };
    })
    .filter((m): m is BackendMoviePlaceholder => !!m);

  return {
    movies,
    page: Number(raw.page || 1),
    pageSize: Number(raw.pageSize || raw.page_size || 20),
    totalMovies: Number(raw.totalMovies || raw.total_movies || 0),
    hasMore: Boolean(raw.hasMore || raw.has_more),
    nextPage: raw.nextPage !== undefined ? raw.nextPage : (raw.next_page !== undefined ? raw.next_page : null),
    customTitle: raw.customTitle !== undefined ? raw.customTitle : (raw.custom_title !== undefined ? raw.custom_title : null),
  };
};

/**
 * Pipeline helper normalising, hydrating, and adapting paginated section responses
 */
export const processSectionPageResponse = async (raw: any): Promise<HydratedSectionPage> => {
  const normalized = normalizeSectionPage(raw);
  const ids = normalized.movies.map((m) => m.id);
  
  if (ids.length === 0) {
    return {
      movies: [],
      page: normalized.page,
      pageSize: normalized.pageSize,
      totalMovies: normalized.totalMovies,
      hasMore: normalized.hasMore,
      nextPage: normalized.nextPage,
      customTitle: normalized.customTitle,
    };
  }

  const movieDetailsList = await movieService.getMoviesByIds(ids);
  const movieMap = new Map(movieDetailsList.map((m) => [m.id, m]));

  const movies = normalized.movies
    .map((m) => {
      const details = movieMap.get(m.id);
      if (details && isMovieReleased(details)) {
        return {
          ...details,
          score: m.score,
          reasons: m.reasons,
        };
      }
      return null;
    })
    .filter((m): m is MovieDetails & { score?: number; reasons?: string[] } => m !== null);

  return {
    movies,
    page: normalized.page,
    pageSize: normalized.pageSize,
    totalMovies: normalized.totalMovies,
    hasMore: normalized.hasMore,
    nextPage: normalized.nextPage,
    customTitle: normalized.customTitle,
  };
};
