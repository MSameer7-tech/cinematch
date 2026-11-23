import { recommendationApi } from '../../recommendations/api/recommendation.api';

export const analyticsService = {
  logEvent: async (
    userId: string,
    action: string,
    movieId?: number,
    score?: number,
    sectionType = 'search'
  ) => {
    try {
      await recommendationApi.submitEvent(userId, action, movieId, score, sectionType);
    } catch (e) {
      console.error(`Failed to log search analytics event: ${action}`, e);
    }
  },

  logTyped: (userId: string, query: string) => {
    // Score contains query length for tracking average length
    analyticsService.logEvent(userId, 'typed', undefined, query.length);
  },

  logSuggestionOpened: (userId: string) => {
    analyticsService.logEvent(userId, 'suggestion_opened');
  },

  logSuggestionClicked: (userId: string, movieId?: number, index?: number) => {
    analyticsService.logEvent(userId, 'suggestion_clicked', movieId, index);
  },

  logSearchSubmitted: (userId: string, query: string, resultsCount: number) => {
    analyticsService.logEvent(userId, 'submitted', undefined, resultsCount);
  },

  logMovieClicked: (userId: string, movieId: number, position: number) => {
    analyticsService.logEvent(userId, 'clicked', movieId, position, 'search');
  },

  logSearchScrolled: (userId: string, pageCount: number) => {
    analyticsService.logEvent(userId, 'scrolled', undefined, pageCount);
  },

  logMovieWatchlisted: (userId: string, movieId: number) => {
    analyticsService.logEvent(userId, 'watchlisted', movieId, undefined, 'search');
  },

  logMovieFavorited: (userId: string, movieId: number) => {
    analyticsService.logEvent(userId, 'favorited', movieId, undefined, 'search');
  },

  logMovieRated: (userId: string, movieId: number, rating: number) => {
    analyticsService.logEvent(userId, 'rated', movieId, rating, 'search');
  },

  logSearchShared: (userId: string, movieId?: number) => {
    analyticsService.logEvent(userId, 'shared', movieId);
  }
};
export default analyticsService;
