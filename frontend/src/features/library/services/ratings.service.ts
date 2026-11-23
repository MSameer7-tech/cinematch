import { supabase } from '../../../lib/supabase';
import type { RatingEntry } from '../types/library.types';

export const ratingsService = {
  async getRatings(): Promise<RatingEntry[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', user.user.id)
      .order('rated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserRating(movieId: number): Promise<RatingEntry | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('media_id', movieId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async rateMovie(movieId: number, rating: number): Promise<RatingEntry> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ratings')
      .upsert(
        { user_id: user.user.id, media_id: movieId, media_type: 'movie', rating, rated_at: new Date().toISOString() },
        { onConflict: 'user_id,media_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRating(movieId: number, rating: number): Promise<RatingEntry> {
    return this.rateMovie(movieId, rating);
  },

  async deleteRating(movieId: number): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('user_id', user.user.id)
      .eq('media_id', movieId);

    if (error) throw error;
  }
};
