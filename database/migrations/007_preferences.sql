-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Future-proof schema for AI recommendations
    favorite_genres INTEGER[] DEFAULT '{}',
    favorite_decades INTEGER[] DEFAULT '{}',
    favorite_languages TEXT[] DEFAULT '{}',
    favorite_countries TEXT[] DEFAULT '{}',
    favorite_runtime INTEGER, -- Max runtime in minutes
    favorite_moods TEXT[] DEFAULT '{}',
    hide_watched BOOLEAN NOT NULL DEFAULT FALSE,
    include_adult BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_providers INTEGER[] DEFAULT '{}', -- E.g. TMDB provider IDs (Netflix, Hulu)
    favorite_directors INTEGER[] DEFAULT '{}', -- TMDB Person IDs
    favorite_actors INTEGER[] DEFAULT '{}', -- TMDB Person IDs
    theme VARCHAR(20) NOT NULL DEFAULT 'system',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
