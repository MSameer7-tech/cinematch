import { useQuery } from '@tanstack/react-query';
import { recommendationApi } from '../api/recommendation.api';
import { movieService } from '../../movies/services/movie.service';
import { isMovieReleased } from '../../movies/utils/movie.mapper';
import type { RecommendationRequest } from '../types/recommendation.types';
import type { MovieDetails } from '../../movies/types/movie.types';

export interface HydratedRecommendation {
  movie: MovieDetails;
  score: number;
  reasons: string[];
}

export const useRecommendations = (req: RecommendationRequest, enabled: boolean = true) => {
  return useQuery({
    // Only use user_id in the cache key so invalidateQueries(["recommendations", userId]) works seamlessly
    queryKey: ['recommendations', req.user_id],
    queryFn: async (): Promise<HydratedRecommendation[]> => {
      // 1. Fetch raw recommendations from AI Engine
      const rawData = await recommendationApi.getRecommendations(req);
      
      // 2. Extract IDs
      const movieIds = rawData.recommendations.map(r => r.media_id);
      
      if (movieIds.length === 0) {
        return [];
      }
      
      // 3. Hydrate via existing TMDB service
      const movies = await movieService.getMoviesByIds(movieIds);
      
      // 4. Merge back together, excluding unreleased movies
      const hydrated: HydratedRecommendation[] = [];
      
      for (const rec of rawData.recommendations) {
        const movie = movies.find(m => m.id === rec.media_id);
        if (movie && isMovieReleased(movie)) {
          hydrated.push({
            movie,
            score: rec.score,
            reasons: rec.reasons,
          });
        }
      }
      
      return hydrated;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
