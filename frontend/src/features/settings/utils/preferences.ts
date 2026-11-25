import { useState, useEffect } from 'react';

export type ContentRegion = 'all' | 'bollywood' | 'international';

export interface UserPreferences {
  hqPosters: boolean;
  autoPlayTrailers: boolean;
  trailerSound: boolean;
  contentRegion: ContentRegion;
  includeMature: boolean;
}

export const PREF_KEYS = {
  HQ_POSTERS: 'cinematch_hq_posters',
  AUTOPLAY_TRAILERS: 'cinematch_autoplay_trailers',
  TRAILER_SOUND: 'cinematch_trailer_sound',
  CONTENT_REGION: 'cinematch_content_region',
  INCLUDE_MATURE: 'cinematch_include_mature',
} as const;

const PREF_EVENT = 'cinematch_preferences_changed';

export const getUserPreferences = (): UserPreferences => {
  try {
    const region = localStorage.getItem(PREF_KEYS.CONTENT_REGION);
    const validRegion: ContentRegion =
      region === 'bollywood' || region === 'international' ? region : 'all';

    return {
      hqPosters: localStorage.getItem(PREF_KEYS.HQ_POSTERS) !== 'false',
      autoPlayTrailers: localStorage.getItem(PREF_KEYS.AUTOPLAY_TRAILERS) !== 'false',
      trailerSound: localStorage.getItem(PREF_KEYS.TRAILER_SOUND) === 'true',
      contentRegion: validRegion,
      includeMature: localStorage.getItem(PREF_KEYS.INCLUDE_MATURE) !== 'false',
    };
  } catch {
    return {
      hqPosters: true,
      autoPlayTrailers: true,
      trailerSound: false,
      contentRegion: 'all',
      includeMature: true,
    };
  }
};

export const setUserPreference = <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void => {
  try {
    switch (key) {
      case 'hqPosters':
        localStorage.setItem(PREF_KEYS.HQ_POSTERS, String(value));
        break;
      case 'autoPlayTrailers':
        localStorage.setItem(PREF_KEYS.AUTOPLAY_TRAILERS, String(value));
        break;
      case 'trailerSound':
        localStorage.setItem(PREF_KEYS.TRAILER_SOUND, String(value));
        break;
      case 'contentRegion':
        localStorage.setItem(PREF_KEYS.CONTENT_REGION, String(value));
        break;
      case 'includeMature':
        localStorage.setItem(PREF_KEYS.INCLUDE_MATURE, String(value));
        break;
    }
    window.dispatchEvent(new Event(PREF_EVENT));
  } catch (err) {
    console.warn('Failed to persist preference:', err);
  }
};

export const resetUserPreferences = (): void => {
  try {
    localStorage.setItem(PREF_KEYS.HQ_POSTERS, 'true');
    localStorage.setItem(PREF_KEYS.AUTOPLAY_TRAILERS, 'true');
    localStorage.setItem(PREF_KEYS.TRAILER_SOUND, 'false');
    localStorage.setItem(PREF_KEYS.CONTENT_REGION, 'all');
    localStorage.setItem(PREF_KEYS.INCLUDE_MATURE, 'true');
    window.dispatchEvent(new Event(PREF_EVENT));
  } catch (err) {
    console.warn('Failed to reset preferences:', err);
  }
};

export const useUserPreferences = (): UserPreferences => {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences);

  useEffect(() => {
    const sync = () => setPrefs(getUserPreferences());
    window.addEventListener(PREF_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PREF_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return prefs;
};
