import { supabase } from '../../../lib/supabase';
import type { FavoriteEntry } from '../types/library.types';

const LOCAL_STORAGE_KEY = 'cinematch_local_favorites';

const getLocalFavorites = (): FavoriteEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalFavorites = (list: FavoriteEntry[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save local favorites:', err);
  }
};

export const favoritesService = {
  async getFavorites(): Promise<FavoriteEntry[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return getLocalFavorites();
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getFavorites error, using local fallback:', error);
        return getLocalFavorites();
      }
      return data || [];
    } catch {
      return getLocalFavorites();
    }
  },

  async addToFavorites(movieId: number): Promise<FavoriteEntry> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        const local = getLocalFavorites();
        const existing = local.find(e => e.media_id === movieId);
        if (existing) return existing;
        const newEntry: FavoriteEntry = {
          id: `local-fav-${Date.now()}-${movieId}`,
          user_id: 'guest',
          media_id: movieId,
          created_at: new Date().toISOString(),
        };
        saveLocalFavorites([newEntry, ...local]);
        return newEntry;
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: user.user.id, media_id: movieId, media_type: 'movie' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase addToFavorites error, using local fallback:', error);
        const local = getLocalFavorites();
        const newEntry: FavoriteEntry = {
          id: `local-fav-${Date.now()}-${movieId}`,
          user_id: user.user.id,
          media_id: movieId,
          created_at: new Date().toISOString(),
        };
        saveLocalFavorites([newEntry, ...local]);
        return newEntry;
      }
      return data;
    } catch {
      const local = getLocalFavorites();
      const newEntry: FavoriteEntry = {
        id: `local-fav-${Date.now()}-${movieId}`,
        user_id: 'guest',
        media_id: movieId,
        created_at: new Date().toISOString(),
      };
      saveLocalFavorites([newEntry, ...local]);
      return newEntry;
    }
  },

  async removeFromFavorites(movieId: number): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        const local = getLocalFavorites();
        saveLocalFavorites(local.filter(e => e.media_id !== movieId));
        return;
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.user.id)
        .eq('media_id', movieId);

      if (error) {
        console.warn('Supabase removeFromFavorites error, updating local:', error);
      }
      const local = getLocalFavorites();
      saveLocalFavorites(local.filter(e => e.media_id !== movieId));
    } catch {
      const local = getLocalFavorites();
      saveLocalFavorites(local.filter(e => e.media_id !== movieId));
    }
  }
};
