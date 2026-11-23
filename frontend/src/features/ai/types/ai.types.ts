import type { HydratedRecommendation } from '../../recommendations/hooks/useRecommendations';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  movies?: HydratedRecommendation[];
  isLoading?: boolean;
}

export interface AIChatRequest {
  conversation_id: string;
  user_id: string;
  message: string;
}

export interface TasteGenre {
  name: string;
  percentage: number;
}

export interface TasteProfile {
  user_id: string;
  persona_title: string;
  critic_style: string;
  summary: string;
  average_rating: number;
  total_ratings: number;
  total_favorites: number;
  total_watchlist: number;
  top_genres: TasteGenre[];
  avoid_genres: string[];
  favorite_directors: string[];
  favorite_actors: string[];
  thematic_tags: string[];
  taste_document_text: string;
}

export interface AIChatResponse {
  reply: string;
  movies: any[];
  taste_profile?: TasteProfile;
}
