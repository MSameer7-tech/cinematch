-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a user only has one rating per movie so they can update it
    UNIQUE(user_id, movie_id)
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_movie_id ON public.ratings(movie_id);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own ratings"
    ON public.ratings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
    ON public.ratings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
    ON public.ratings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
    ON public.ratings
    FOR DELETE
    USING (auth.uid() = user_id);
