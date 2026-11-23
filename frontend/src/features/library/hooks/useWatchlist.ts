import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryKeys } from '../../../lib/react-query/queryKeys';
import { watchlistService } from '../services/watchlist.service';
import type { WatchlistEntry } from '../types/library.types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';
import { recommendationApi } from '../../recommendations/api/recommendation.api';

export const useWatchlist = () => {
  return useQuery({
    queryKey: libraryKeys.watchlist,
    queryFn: watchlistService.getWatchlist,
  });
};

export const useToggleWatchlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ movieId, isWatchlisted }: { movieId: number; isWatchlisted: boolean }) => {
      if (isWatchlisted) {
        await watchlistService.removeFromWatchlist(movieId);
      } else {
        await watchlistService.addToWatchlist(movieId);
      }
      return { movieId, isWatchlisted };
    },
    onMutate: async ({ movieId, isWatchlisted }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.watchlist });
      const previousWatchlist = queryClient.getQueryData<WatchlistEntry[]>(libraryKeys.watchlist);

      queryClient.setQueryData<WatchlistEntry[]>(libraryKeys.watchlist, (old) => {
        if (!old) {
          if (isWatchlisted) return [];
          return [{ id: 'temp', user_id: 'temp', media_id: movieId, created_at: new Date().toISOString() }];
        }
        if (isWatchlisted) {
          return old.filter(entry => entry.media_id !== movieId);
        } else {
          return [{ id: 'temp', user_id: 'temp', media_id: movieId, created_at: new Date().toISOString() }, ...old];
        }
      });

      return { previousWatchlist };
    },
    onError: (err, _variables, context) => {
      console.error('Watchlist mutation failed:', err);
      toast.error('Failed to update Watchlist');
      if (context?.previousWatchlist) {
        queryClient.setQueryData(libraryKeys.watchlist, context.previousWatchlist);
      }
    },
    onSuccess: (data) => {
      if (data.isWatchlisted) {
        toast.success('Removed from Watchlist');
      } else {
        toast.success('Added to Watchlist');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.watchlist });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      if (user) {
        recommendationApi.invalidateCache(user.id).catch(console.error);
      }
    },
  });
};
