/**
 * Application environment configuration.
 * Centralizes and validates environment variables.
 */

const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Environment variable ${name} is missing.`);
  }
  return value;
};

export const env = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  TMDB_TOKEN: getEnvVar('VITE_TMDB_TOKEN'),
  TMDB_BASE_URL: getEnvVar('VITE_TMDB_BASE_URL'),
  TMDB_IMAGE_URL: getEnvVar('VITE_TMDB_IMAGE_URL'),
  TMDB_API: getEnvVar('VITE_TMDB_API'),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
