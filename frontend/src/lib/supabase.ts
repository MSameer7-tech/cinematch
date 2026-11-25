import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Shared Supabase client instance.
 * Used for all authentication and database communication.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
