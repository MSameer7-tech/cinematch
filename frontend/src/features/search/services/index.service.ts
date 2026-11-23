import { searchApi } from '../api/search.api';
import type { SearchBootstrapPayload } from '../types/search.types';

let preloadedIndex: SearchBootstrapPayload | null = null;
let preloadingPromise: Promise<SearchBootstrapPayload> | null = null;

export const indexService = {
  preloadIndex: async (): Promise<SearchBootstrapPayload> => {
    if (preloadedIndex) return preloadedIndex;
    if (preloadingPromise) return preloadingPromise;

    preloadingPromise = searchApi.getSearchBootstrap()
      .then((data) => {
        preloadedIndex = data;
        return data;
      })
      .catch((err) => {
        preloadingPromise = null;
        console.error("Failed to preload search index:", err);
        throw err;
      });

    return preloadingPromise;
  },

  getIndex: () => preloadedIndex,
  isLoaded: () => !!preloadedIndex,
};
export default indexService;
