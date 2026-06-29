/**
 * TMDB Image Configuration and Placeholders
 */

export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    ORIGINAL: 'original',
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
  },
  PROFILE: {
    SMALL: 'w45',
    MEDIUM: 'w185',
    LARGE: 'h632',
    ORIGINAL: 'original',
  }
} as const;

export const PLACEHOLDERS = {
  POSTER: '/assets/placeholders/poster-placeholder.svg',
  BACKDROP: '/assets/placeholders/backdrop-placeholder.svg',
  PROFILE: '/assets/placeholders/profile-placeholder.svg',
} as const;
