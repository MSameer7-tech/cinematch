import { supabase } from '../../../lib/supabase';
import type { RatingEntry } from '../types/library.types';

const LOCAL_STORAGE_KEY = 'cinematch_local_ratings';

const getLocalRatings = (): RatingEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalRatings = (list: RatingEntry[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save local ratings:', err);
  }
};

export const ratingsService = {
  async getRatings(): Promise<RatingEntry[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return getLocalRatings();
      }

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.user.id)
        .order('rated_at', { ascending: false });

      if (error) {
        console.warn('Supabase getRatings error, using local fallback:', error);
        return getLocalRatings();
      }

      // Sync local cache with remote data
      if (data && data.length > 0) {
        saveLocalRatings(data);
      }
      return data || getLocalRatings();
    } catch {
      return getLocalRatings();
    }
  },

  async getUserRating(movieId: number): Promise<RatingEntry | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        const local = getLocalRatings();
        return local.find(e => e.media_id === movieId) || null;
      }

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('media_id', movieId)
        .maybeSingle();

      if (error) {
        const local = getLocalRatings();
        return local.find(e => e.media_id === movieId) || null;
      }
      return data;
    } catch {
      const local = getLocalRatings();
      return local.find(e => e.media_id === movieId) || null;
    }
  },

  async rateMovie(movieId: number, rating: number): Promise<RatingEntry> {
    const now = new Date().toISOString();
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        // Guest user local storage handling
        const local = getLocalRatings();
        const existingIdx = local.findIndex(e => e.media_id === movieId);
        const newEntry: RatingEntry = {
          id: existingIdx >= 0 ? local[existingIdx].id : `local-rating-${Date.now()}-${movieId}`,
          user_id: 'guest',
          media_id: movieId,
          rating,
          rated_at: now,
        };

        const updated = existingIdx >= 0
          ? local.map((e, idx) => (idx === existingIdx ? newEntry : e))
          : [newEntry, ...local];

        saveLocalRatings(updated);
        return newEntry;
      }

      // Authenticated user Supabase upsert
      const { data, error } = await supabase
        .from('ratings')
        .upsert(
          { 
            user_id: user.user.id, 
            media_id: movieId, 
            media_type: 'movie', 
            rating, 
            rated_at: now 
          },
          { onConflict: 'user_id,media_id' }
        )
        .select()
        .single();

      if (error) {
        console.warn('Supabase rateMovie error, using local fallback:', error);
        const local = getLocalRatings();
        const existingIdx = local.findIndex(e => e.media_id === movieId);
        const newEntry: RatingEntry = {
          id: existingIdx >= 0 ? local[existingIdx].id : `local-rating-${Date.now()}-${movieId}`,
          user_id: user.user.id,
          media_id: movieId,
          rating,
          rated_at: now,
        };
        const updated = existingIdx >= 0
          ? local.map((e, idx) => (idx === existingIdx ? newEntry : e))
          : [newEntry, ...local];
        saveLocalRatings(updated);
        return newEntry;
      }

      // Also sync to local cache
      const local = getLocalRatings();
      const existingIdx = local.findIndex(e => e.media_id === movieId);
      const updated = existingIdx >= 0
        ? local.map((e, idx) => (idx === existingIdx ? data : e))
        : [data, ...local];
      saveLocalRatings(updated);

      return data;
    } catch (err) {
      console.warn('rateMovie caught error, using local fallback:', err);
      const local = getLocalRatings();
      const existingIdx = local.findIndex(e => e.media_id === movieId);
      const newEntry: RatingEntry = {
        id: existingIdx >= 0 ? local[existingIdx].id : `local-rating-${Date.now()}-${movieId}`,
        user_id: 'guest',
        media_id: movieId,
        rating,
        rated_at: now,
      };
      const updated = existingIdx >= 0
        ? local.map((e, idx) => (idx === existingIdx ? newEntry : e))
        : [newEntry, ...local];
      saveLocalRatings(updated);
      return newEntry;
    }
  },

  async updateRating(movieId: number, rating: number): Promise<RatingEntry> {
    return this.rateMovie(movieId, rating);
  },

  async deleteRating(movieId: number): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { error } = await supabase
          .from('ratings')
          .delete()
          .eq('user_id', user.user.id)
          .eq('media_id', movieId);

        if (error) {
          console.warn('Supabase deleteRating error, updating local:', error);
        }
      }
      const local = getLocalRatings();
      saveLocalRatings(local.filter(e => e.media_id !== movieId));
    } catch {
      const local = getLocalRatings();
      saveLocalRatings(local.filter(e => e.media_id !== movieId));
    }
  }
};
