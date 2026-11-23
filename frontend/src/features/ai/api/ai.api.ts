import type { AIChatRequest, AIChatResponse, TasteProfile } from '../types/ai.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const aiApi = {
  sendMessage: async (req: AIChatRequest): Promise<AIChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    
    if (!response.ok) {
      throw new Error(`AI Chat failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  getTasteProfile: async (userId: string, refresh = false): Promise<TasteProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/taste-profile?refresh=${refresh}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch taste profile: ${response.statusText}`);
    }
    return response.json();
  },

  refreshTasteProfile: async (userId: string): Promise<TasteProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/taste-profile/refresh`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`Failed to refresh taste profile: ${response.statusText}`);
    }
    return response.json();
  }
};
