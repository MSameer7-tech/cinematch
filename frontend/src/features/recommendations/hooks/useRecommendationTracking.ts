import { recommendationApi } from '../api/recommendation.api';

export const useRecommendationTracking = () => {
  const submitFeedback = (userId: string, movieId: number, feedbackType: 'LIKE' | 'DISLIKE') => {
    recommendationApi.submitFeedback(userId, movieId, feedbackType).catch(console.error);
  };

  const trackEvent = (userId: string, eventType: string, movieId?: number, score?: number) => {
    recommendationApi.submitEvent(userId, eventType, movieId, score).catch(console.error);
  };

  return { submitFeedback, trackEvent };
};
