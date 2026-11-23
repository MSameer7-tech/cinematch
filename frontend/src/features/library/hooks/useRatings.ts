import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryKeys } from '../../../lib/react-query/queryKeys';
import { ratingsService } from '../services/ratings.service';
import type { RatingEntry } from '../types/library.types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';
import { recommendationApi } from '../../recommendations/api/recommendation.api';

export const useRatings = () => {
  return useQuery({
    queryKey: libraryKeys.ratings,
    queryFn: ratingsService.getRatings,
  });
};

export const useRateMovie = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ movieId, rating }: { movieId: number; rating: number }) => 
      ratingsService.rateMovie(movieId, rating),
    onMutate: async ({ movieId, rating }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.ratings });
      const previousRatings = queryClient.getQueryData<RatingEntry[]>(libraryKeys.ratings);

      queryClient.setQueryData<RatingEntry[]>(libraryKeys.ratings, (old) => {
        if (!old) return [{ id: 'temp', user_id: 'temp', media_id: movieId, rating, rated_at: new Date().toISOString() }];
        
        const existingIndex = old.findIndex(entry => entry.media_id === movieId);
        if (existingIndex >= 0) {
          const newArray = [...old];
          newArray[existingIndex] = { ...newArray[existingIndex], rating, rated_at: new Date().toISOString() };
          return newArray;
        }
        
        return [{ id: 'temp', user_id: 'temp', media_id: movieId, rating, rated_at: new Date().toISOString() }, ...old];
      });

      return { previousRatings };
    },
    onError: (err, _variables, context) => {
      console.error('Ratings mutation failed:', err);
      toast.error('Failed to save rating');
      if (context?.previousRatings) {
        queryClient.setQueryData(libraryKeys.ratings, context.previousRatings);
      }
    },
    onSuccess: () => {
      toast.success('Saved Rating');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.ratings });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      if (user) {
        recommendationApi.invalidateCache(user.id).catch(console.error);
      }
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ratingsService.deleteRating,
    onError: (err) => {
      console.error('Delete rating failed:', err);
      toast.error('Failed to delete rating');
    },
    onSuccess: () => {
      toast.success('Removed Rating');
      queryClient.invalidateQueries({ queryKey: libraryKeys.ratings });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      if (user) {
        recommendationApi.invalidateCache(user.id).catch(console.error);
      }
    }
  });
};
