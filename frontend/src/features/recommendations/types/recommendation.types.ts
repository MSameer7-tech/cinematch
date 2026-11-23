export interface RawRecommendation {
  media_id: number;
  score: number;
  reasons: string[];
}

export interface RawRecommendationResponse {
  recommendations: RawRecommendation[];
}

export interface RecommendationRequest {
  user_id: string;
  limit?: number;
  exclude_seen?: boolean;
  refresh?: boolean;
}

export interface Recommendation {
  movieId: number;
  score: number;
  reasons: string[];
}
