import { env } from '../../../config/env';
import { IMAGE_SIZES, PLACEHOLDERS } from '../constants/images';

/**
 * Image resolution utilities that safely generate fully qualified TMDB URLs.
 */

export const getPosterUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.POSTER.LARGE
): string => {
  if (!path) return PLACEHOLDERS.POSTER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${env.TMDB_IMAGE_URL}/${size}${cleanPath}`;
};

export const getBackdropUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.BACKDROP.LARGE
): string => {
  if (!path) return PLACEHOLDERS.BACKDROP;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${env.TMDB_IMAGE_URL}/${size}${cleanPath}`;
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
