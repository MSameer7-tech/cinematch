import type { FC } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { RecommendationCarousel } from './RecommendationCarousel';
import { RecommendationSkeleton } from './RecommendationSkeleton';
import { RecommendationError } from './RecommendationError';
import { RecommendationEmpty } from './RecommendationEmpty';
import { useRecommendationTracking } from '../hooks/useRecommendationTracking';

interface RecommendationsSectionProps {
  userId: string;
}

export const RecommendationsSection: FC<RecommendationsSectionProps> = ({ userId }) => {
  const { data: recommendations, isLoading, isError, refetch, isFetching } = useRecommendations({
    user_id: userId,
    limit: 20
  });
  const { submitFeedback, trackEvent } = useRecommendationTracking();

  if (isLoading) return <RecommendationSkeleton />;
  
  if (isError) return <RecommendationError onRetry={() => refetch()} />;
  
  if (!recommendations || recommendations.length === 0) return <RecommendationEmpty />;

  return (
    <RecommendationCarousel 
      recommendations={recommendations} 
      onRefresh={() => refetch()} 
      isRefreshing={isFetching}
      onCardClick={(id, score) => trackEvent(userId, 'clicked', id, score)}
      onCardShown={(id, score) => trackEvent(userId, 'shown', id, score)}
      onCardAction={(id, action, score) => trackEvent(userId, action, id, score)}
      onFeedback={(id, type) => submitFeedback(userId, id, type)}
    />
  );
};
