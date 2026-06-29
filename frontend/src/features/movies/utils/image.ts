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
  return `${env.TMDB_IMAGE_URL}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.BACKDROP.LARGE
): string => {
  if (!path) return PLACEHOLDERS.BACKDROP;
  return `${env.TMDB_IMAGE_URL}/${size}${path}`;
};

export const getProfileUrl = (
  path: string | null | undefined, 
  size: string = IMAGE_SIZES.PROFILE.MEDIUM
): string => {
  if (!path) return PLACEHOLDERS.PROFILE;
  return `${env.TMDB_IMAGE_URL}/${size}${path}`;
};
