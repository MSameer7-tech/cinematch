import { env } from '../../../config/env';
import { IMAGE_SIZES, PLACEHOLDERS } from '../constants/images';
import { getUserPreferences } from '../../settings/utils/preferences';

/**
 * Image resolution utilities that safely generate fully qualified TMDB URLs
 * while respecting the user's High-Resolution Artwork preference.
 */

export const getPosterUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.POSTER.LARGE
): string => {
  if (!path) return PLACEHOLDERS.POSTER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const { hqPosters } = getUserPreferences();
  const effectiveSize = hqPosters
    ? (size === 'w500' || size === 'w780' ? 'original' : size)
    : (size === 'original' || size === 'w780' || size === 'w500' ? 'w342' : size);
  return `${env.TMDB_IMAGE_URL}/${effectiveSize}${cleanPath}`;
};

export const getBackdropUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.BACKDROP.LARGE
): string => {
  if (!path) return PLACEHOLDERS.BACKDROP;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const { hqPosters } = getUserPreferences();
  const effectiveSize = hqPosters
    ? 'original'
    : (size === 'original' || size === 'w1280' ? 'w780' : size);
  return `${env.TMDB_IMAGE_URL}/${effectiveSize}${cleanPath}`;
};

export const getProfileUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.PROFILE.MEDIUM
): string => {
  if (!path) return PLACEHOLDERS.PROFILE;
  return `${env.TMDB_IMAGE_URL}/${size}${path}`;
};

export const getLogoUrl = (
  path: string | null | undefined,
  size: string = 'w500'
): string | null => {
  if (!path) return null;
  return `${env.TMDB_IMAGE_URL}/${size}${path}`;
};
