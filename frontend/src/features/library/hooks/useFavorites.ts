import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryKeys } from '../../../lib/react-query/queryKeys';
import { favoritesService } from '../services/favorites.service';
import type { FavoriteEntry } from '../types/library.types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';
import { recommendationApi } from '../../recommendations/api/recommendation.api';

export const useFavorites = () => {
  return useQuery({
    queryKey: libraryKeys.favorites,
    queryFn: favoritesService.getFavorites,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ movieId, isFavorited }: { movieId: number; isFavorited: boolean }) => {
      if (isFavorited) {
        await favoritesService.removeFromFavorites(movieId);
      } else {
        await favoritesService.addToFavorites(movieId);
      }
      return { movieId, isFavorited };
    },
    onMutate: async ({ movieId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.favorites });
      const previousFavorites = queryClient.getQueryData<FavoriteEntry[]>(libraryKeys.favorites);

      queryClient.setQueryData<FavoriteEntry[]>(libraryKeys.favorites, (old) => {
        if (!old) {
          if (isFavorited) return [];
          return [{ id: 'temp', user_id: 'temp', media_id: movieId, created_at: new Date().toISOString() }];
        }
        if (isFavorited) {
          return old.filter(entry => entry.media_id !== movieId);
        } else {
          return [{ id: 'temp', user_id: 'temp', media_id: movieId, created_at: new Date().toISOString() }, ...old];
        }
      });

      return { previousFavorites };
    },
    onError: (err, _variables, context) => {
      console.error('Favorites mutation failed:', err);
      toast.error('Failed to update Favorites');
      if (context?.previousFavorites) {
        queryClient.setQueryData(libraryKeys.favorites, context.previousFavorites);
      }
    },
    onSuccess: (data) => {
      if (data.isFavorited) {
        toast.success('Removed from Favorites');
      } else {
        toast.success('Added to Favorites');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      if (user) {
        recommendationApi.invalidateCache(user.id).catch(console.error);
      }
    },
  });
};
