import { supabase } from '../../../lib/supabase';
import type { UserPreferences } from '../types/library.types';

export const preferencesService = {
  async getPreferences(): Promise<UserPreferences | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(
        { user_id: user.user.id, ...preferences, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async savePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.updatePreferences(preferences);
  }
};
