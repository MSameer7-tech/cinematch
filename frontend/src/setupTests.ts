import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof Element !== 'undefined') {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = vi.fn();
  }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
}

const testEnvDefaults: Record<string, string> = {
  VITE_SUPABASE_URL: 'https://test-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_TMDB_TOKEN: 'test-tmdb-token',
  VITE_TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  VITE_TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
  VITE_TMDB_API: 'test-tmdb-api-key',
};

for (const [key, fallback] of Object.entries(testEnvDefaults)) {
  if (!import.meta.env[key]) {
    vi.stubEnv(key, fallback);
  }
}
