import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryKeys } from '../../../lib/react-query/queryKeys';
import { preferencesService } from '../services/preferences.service';
import type { UserPreferences } from '../types/library.types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';
import { recommendationApi } from '../../recommendations/api/recommendation.api';

export const usePreferences = () => {
  return useQuery({
    queryKey: libraryKeys.preferences,
    queryFn: preferencesService.getPreferences,
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: preferencesService.updatePreferences,
    onMutate: async (newPreferences) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.preferences });
      const previousPreferences = queryClient.getQueryData<UserPreferences>(libraryKeys.preferences);

      queryClient.setQueryData<UserPreferences>(libraryKeys.preferences, (old) => {
        if (!old) return newPreferences as UserPreferences;
        return { ...old, ...newPreferences };
      });

      return { previousPreferences };
    },
    onError: (err, _variables, context) => {
      console.error('Preferences update failed:', err);
      toast.error('Failed to save preferences');
      if (context?.previousPreferences) {
        queryClient.setQueryData(libraryKeys.preferences, context.previousPreferences);
      }
    },
    onSuccess: () => {
      toast.success('Saved Preferences');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.preferences });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      if (user) {
        recommendationApi.invalidateCache(user.id).catch(console.error);
      }
    },
  });
};
