import { supabase } from '../../../lib/supabase';
import type { WatchlistEntry } from '../types/library.types';

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistEntry[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToWatchlist(movieId: number): Promise<WatchlistEntry> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('watchlists')
      .insert({ user_id: user.user.id, media_id: movieId, media_type: 'movie' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(movieId: number): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', user.user.id)
      .eq('media_id', movieId);

    if (error) throw error;
  }
};
