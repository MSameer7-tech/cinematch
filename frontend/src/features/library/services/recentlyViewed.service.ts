import { supabase } from '../../../lib/supabase';
import type { RecentlyViewedEntry } from '../types/library.types';

export const recentlyViewedService = {
  async getRecentlyViewed(): Promise<RecentlyViewedEntry[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recently_viewed')
      .select('*')
      .eq('user_id', user.user.id)
      .order('viewed_at', { ascending: false })
      .limit(10); // Display Latest 10 movies

    if (error) throw error;
    return data;
  },

  async addRecentlyViewed(movieId: number): Promise<RecentlyViewedEntry> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recently_viewed')
      .upsert(
        { user_id: user.user.id, media_id: movieId, media_type: 'movie', viewed_at: new Date().toISOString() },
        { onConflict: 'user_id,media_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clearRecentlyViewed(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('recently_viewed')
      .delete()
      .eq('user_id', user.user.id);

    if (error) throw error;
  }
};
