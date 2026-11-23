import { supabase } from '../../../lib/supabase';
import type { FavoriteEntry } from '../types/library.types';

export const favoritesService = {
  async getFavorites(): Promise<FavoriteEntry[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToFavorites(movieId: number): Promise<FavoriteEntry> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: user.user.id, media_id: movieId, media_type: 'movie' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromFavorites(movieId: number): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.user.id)
      .eq('media_id', movieId);

    if (error) throw error;
  }
};
