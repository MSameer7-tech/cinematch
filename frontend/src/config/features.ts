/**
 * Application feature flags.
 * Used to conditionally enable or disable features globally.
 */

export const features = {
  ENABLE_AI: true,
  ENABLE_REVIEWS: false,
  ENABLE_SOCIAL: false,
  ENABLE_EXPERIMENTAL: true,
} as const;
