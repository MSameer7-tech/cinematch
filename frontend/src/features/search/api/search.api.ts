import type { SearchBootstrapPayload, AISearchStructuredFilters } from '../types/search.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const searchApi = {
  getSearchBootstrap: async (): Promise<SearchBootstrapPayload> => {
    const response = await fetch(`${API_BASE_URL}/search/bootstrap`);
    if (!response.ok) {
      throw new Error(`Failed to load search index bootstrap: ${response.statusText}`);
    }
    return response.json();
  },

  parseAISearch: async (query: string): Promise<AISearchStructuredFilters> => {
    const response = await fetch(`${API_BASE_URL}/search/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      throw new Error(`AI Search Translation failed: ${response.statusText}`);
    }
    return response.json();
  },
};
