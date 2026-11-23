import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryKeys } from '../../../lib/react-query/queryKeys';
import { recentlyViewedService } from '../services/recentlyViewed.service';
import type { RecentlyViewedEntry } from '../types/library.types';

export const useRecentlyViewed = () => {
  return useQuery({
    queryKey: libraryKeys.history,
    queryFn: recentlyViewedService.getRecentlyViewed,
  });
};

export const useAddRecentlyViewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recentlyViewedService.addRecentlyViewed,
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.history });
      const previousHistory = queryClient.getQueryData<RecentlyViewedEntry[]>(libraryKeys.history);

      queryClient.setQueryData<RecentlyViewedEntry[]>(libraryKeys.history, (old) => {
        if (!old) return [{ id: 'temp', user_id: 'temp', media_id: movieId, viewed_at: new Date().toISOString() }];
        
        const filtered = old.filter(entry => entry.media_id !== movieId);
        return [{ id: 'temp', user_id: 'temp', media_id: movieId, viewed_at: new Date().toISOString() }, ...filtered].slice(0, 10);
      });

      return { previousHistory };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(libraryKeys.history, context.previousHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.history });
    },
  });
};

export const useClearRecentlyViewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recentlyViewedService.clearRecentlyViewed,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.history });
      const previousHistory = queryClient.getQueryData<RecentlyViewedEntry[]>(libraryKeys.history);
      queryClient.setQueryData(libraryKeys.history, []);
      return { previousHistory };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(libraryKeys.history, context.previousHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.history });
    },
  });
};
