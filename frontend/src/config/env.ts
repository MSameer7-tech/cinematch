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
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
