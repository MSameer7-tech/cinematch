export const movieKeys = {
  all: ['movies'] as const,
  trending: () => [...movieKeys.all, 'trending'] as const,
  popular: () => [...movieKeys.all, 'popular'] as const,
  topRated: () => [...movieKeys.all, 'top-rated'] as const,
  upcoming: () => [...movieKeys.all, 'upcoming'] as const,
  detail: (id: number) => ['movie', id] as const,
  search: (query: string) => [...movieKeys.all, 'search', query] as const,
  recommendations: (id: number) => ['movie', id, 'recommendations'] as const,
  similar: (id: number) => ['movie', id, 'similar'] as const,
  credits: (id: number) => ['movie', id, 'credits'] as const,
  videos: (id: number) => ['movie', id, 'videos'] as const,
  reviews: (id: number) => ['movie', id, 'reviews'] as const,
};

export const libraryKeys = {
  watchlist: ['library', 'watchlist'] as const,
  favorites: ['library', 'favorites'] as const,
  history: ['library', 'history'] as const,
  ratings: ['library', 'ratings'] as const,
  preferences: ['library', 'preferences'] as const,
};
