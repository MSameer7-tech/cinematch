import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { homepageApi } from '../api/homepage.api';
import { useUserPreferences } from '../../settings/utils/preferences';
import { 
  processHomepageResponse, 
  processSectionPageResponse, 
  type HydratedHomepageResponse,
  type HydratedSectionPage
} from '../adapters/homepageAdapter';

export const useHomepage = (userId: string, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const effectiveUserId = userId || 'anonymous';
  const { contentRegion, includeMature } = useUserPreferences();

  const query = useQuery({
    queryKey: ['homepage-personal', effectiveUserId, contentRegion, includeMature],
    queryFn: async (): Promise<HydratedHomepageResponse> => {
      const raw = await homepageApi.getHomepage(
        effectiveUserId,
        'UTC',
        'en-US',
        undefined,
        contentRegion,
        includeMature
      );
      const hydrated = await processHomepageResponse(raw);
      
      // Seed other caches to split keys (Phase 9)
      queryClient.setQueryData(['homepage-static', effectiveUserId], {
        sections: hydrated.sections.filter(s => s.section_type === 'static'),
        generated_at: hydrated.generated_at,
        request_id: hydrated.request_id
      });

      queryClient.setQueryData(['homepage-hero', effectiveUserId], hydrated.hero);

      return hydrated;
    },
    enabled: enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
    placeholderData: (previousData) => previousData,
  });

  const staticQuery = useQuery({
    queryKey: ['homepage-static', effectiveUserId],
    queryFn: () => null, // Required in TanStack Query v5 even if enabled is false
    enabled: false,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });

  return {
    ...query,
    hero: query.data?.hero || null,
    heroMovies: query.data?.hero_movies || [],
    personaTitle: query.data?.persona_title || null,
    sections: query.data?.sections || [],
    staticSections: staticQuery.data || null,
  };
};

export const useInfiniteHomepageSection = (
  sectionId: string,
  userId: string,
  initialData?: HydratedSectionPage
) => {
  return useInfiniteQuery({
    queryKey: ['homepage-section', sectionId, userId],
    queryFn: async ({ pageParam = 1 }): Promise<HydratedSectionPage> => {
      const raw = await homepageApi.getHomepageSection(sectionId, userId, pageParam);
      return processSectionPageResponse(raw);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: !!userId && !!sectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    maxPages: 10, // Prevent memory bloat (discard oldest pages if scrolling excessively, Phase 5)
    retry: 3, // Retry -> 3 attempts -> Show Error (Phase 9)
    initialData: initialData ? {
      pages: [initialData],
      pageParams: [1],
    } : undefined,
  });
};
