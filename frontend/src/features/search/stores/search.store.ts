import { create } from 'zustand';
import type { 
  FilterParameters, 
  SortOption, 
  RecentSearch, 
  SearchCacheItem 
} from '../types/search.types';
import type { MovieDetails } from '../../movies/types/movie.types';

const defaultFilters: FilterParameters = {
  contentType: 'both',
  genres: [],
  yearMin: null,
  yearMax: null,
  runtimeMin: null,
  runtimeMax: null,
  language: null,
  country: null,
  ratingMin: null,
};

interface SearchStore {
  query: string;
  filters: FilterParameters;
  sort: SortOption;
  results: (MovieDetails & { score?: number; reasons?: string[] })[];
  loading: boolean;
  selectedSuggestion: string | null;
  history: RecentSearch[];
  cache: Record<string, SearchCacheItem>;
  
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterParameters>) => void;
  resetFilters: () => void;
  setSort: (sort: SortOption) => void;
  setResults: (results: (MovieDetails & { score?: number; reasons?: string[] })[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedSuggestion: (val: string | null) => void;
  
  // History Actions (Zustand + LocalStorage sync)
  loadHistory: () => void;
  addHistory: (query: string) => void;
  deleteHistoryItem: (query: string) => void;
  clearHistory: () => void;
  
  // Cache Actions
  addCache: (query: string, filters: FilterParameters, sort: SortOption, page: number, results: any[]) => void;
  getCache: (query: string, filters: FilterParameters, sort: SortOption, page: number) => any[] | null;
}

const getCacheKey = (query: string, filters: FilterParameters, sort: SortOption, page: number) => {
  return `${query}_${JSON.stringify(filters)}_${sort}_page_${page}`;
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  filters: defaultFilters,
  sort: 'relevance',
  results: [],
  loading: false,
  selectedSuggestion: null,
  history: [],
  cache: {},

  setQuery: (query) => set({ query }),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSort: (sort) => set({ sort }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setSelectedSuggestion: (selectedSuggestion) => set({ selectedSuggestion }),

  loadHistory: () => {
    const raw = localStorage.getItem('search_history');
    if (raw) {
      try {
        set({ history: JSON.parse(raw) });
      } catch {
        set({ history: [] });
      }
    }
  },

  addHistory: (query) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim().toLowerCase();
    
    set((state) => {
      // Filter out existing and keep top 20
      const filtered = state.history.filter((h) => h.query.toLowerCase() !== cleanQuery);
      const updated = [
        { query: query.trim(), timestamp: new Date().toISOString() },
        ...filtered
      ].slice(0, 20);
      
      localStorage.setItem('search_history', JSON.stringify(updated));
      return { history: updated };
    });
  },

  deleteHistoryItem: (query) => {
    set((state) => {
      const updated = state.history.filter((h) => h.query !== query);
      localStorage.setItem('search_history', JSON.stringify(updated));
      return { history: updated };
    });
  },

  clearHistory: () => {
    localStorage.removeItem('search_history');
    set({ history: [] });
  },

  addCache: (query, filters, sort, page, results) => {
    const key = getCacheKey(query, filters, sort, page);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          query,
          filters,
          sort,
          page,
          results,
          timestamp: Date.now(),
        }
      }
    }));
  },

  getCache: (query, filters, sort, page) => {
    const key = getCacheKey(query, filters, sort, page);
    const item = get().cache[key];
    if (!item) return null;

    const TTL = 10 * 60 * 1000; // 10 minutes (Phase 12)
    const isExpired = Date.now() - item.timestamp > TTL;
    if (isExpired) {
      // Clean up key
      set((state) => {
        const updatedCache = { ...state.cache };
        delete updatedCache[key];
        return { cache: updatedCache };
      });
      return null;
    }

    return item.results;
  }
}));
