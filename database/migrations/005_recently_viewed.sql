-- Create recently_viewed table
CREATE TABLE IF NOT EXISTS public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a user only has one recently viewed record per movie so we can update the viewed_at timestamp
    UNIQUE(user_id, movie_id)
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_movie_id ON public.recently_viewed(movie_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own recently viewed history"
    ON public.recently_viewed
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently viewed history"
    ON public.recently_viewed
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently viewed history"
    ON public.recently_viewed
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own recently viewed history"
    ON public.recently_viewed
    FOR DELETE
    USING (auth.uid() = user_id);
