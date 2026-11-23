import type { RecommendationRequest, RawRecommendationResponse } from '../types/recommendation.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const recommendationApi = {
  getRecommendations: async (req: RecommendationRequest): Promise<RawRecommendationResponse> => {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Recommendation Engine Error: ${response.statusText}`);
    }

    return response.json();
  },
  
  submitFeedback: async (userId: string, movieId: number, feedbackType: 'LIKE' | 'DISLIKE') => {
    await fetch(`${API_BASE_URL}/recommendations/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, media_id: movieId, feedback_type: feedbackType })
    });
  },

  submitEvent: async (userId: string, eventType: string, movieId?: number, score?: number, sectionType?: string, position?: number) => {
    await fetch(`${API_BASE_URL}/recommendations/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId, 
        event_type: eventType, 
        media_id: movieId, 
        score,
        section_type: sectionType,
        position
      })
    });
  },
  
  invalidateCache: async (userId: string) => {
    await fetch(`${API_BASE_URL}/recommendations/cache/${userId}`, {
      method: 'DELETE'
    });
  }
};
