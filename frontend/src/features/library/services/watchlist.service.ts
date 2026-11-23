import { supabase } from '../../../lib/supabase';
import type { WatchlistEntry } from '../types/library.types';

const LOCAL_STORAGE_KEY = 'cinematch_local_watchlist';

const getLocalWatchlist = (): WatchlistEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalWatchlist = (list: WatchlistEntry[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save local watchlist:', err);
  }
};

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistEntry[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return getLocalWatchlist();
      }

      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getWatchlist error, falling back to local:', error);
        return getLocalWatchlist();
      }
      return data || [];
    } catch {
      return getLocalWatchlist();
    }
  },

  async addToWatchlist(movieId: number): Promise<WatchlistEntry> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        const local = getLocalWatchlist();
        const existing = local.find(e => e.media_id === movieId);
        if (existing) return existing;
        const newEntry: WatchlistEntry = {
          id: `local-${Date.now()}-${movieId}`,
          user_id: 'guest',
          media_id: movieId,
          created_at: new Date().toISOString(),
        };
        saveLocalWatchlist([newEntry, ...local]);
        return newEntry;
      }

      const { data, error } = await supabase
        .from('watchlists')
        .insert({ user_id: user.user.id, media_id: movieId, media_type: 'movie' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase addToWatchlist error, using local fallback:', error);
        const local = getLocalWatchlist();
        const newEntry: WatchlistEntry = {
          id: `local-${Date.now()}-${movieId}`,
          user_id: user.user.id,
          media_id: movieId,
          created_at: new Date().toISOString(),
        };
        saveLocalWatchlist([newEntry, ...local]);
        return newEntry;
      }
      return data;
    } catch {
      const local = getLocalWatchlist();
      const newEntry: WatchlistEntry = {
        id: `local-${Date.now()}-${movieId}`,
        user_id: 'guest',
        media_id: movieId,
        created_at: new Date().toISOString(),
      };
      saveLocalWatchlist([newEntry, ...local]);
      return newEntry;
    }
  },

  async removeFromWatchlist(movieId: number): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        const local = getLocalWatchlist();
        saveLocalWatchlist(local.filter(e => e.media_id !== movieId));
        return;
      }

      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', user.user.id)
        .eq('media_id', movieId);

      if (error) {
        console.warn('Supabase removeFromWatchlist error, updating local:', error);
      }
      const local = getLocalWatchlist();
      saveLocalWatchlist(local.filter(e => e.media_id !== movieId));
    } catch {
      const local = getLocalWatchlist();
      saveLocalWatchlist(local.filter(e => e.media_id !== movieId));
    }
  }
};
