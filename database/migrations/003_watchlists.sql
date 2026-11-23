-- Create watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a user can only add a specific movie once to their watchlist
    UNIQUE(user_id, movie_id)
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_movie_id ON public.watchlists(movie_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_created_at ON public.watchlists(created_at);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own watchlist"
    ON public.watchlists
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist"
    ON public.watchlists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
    ON public.watchlists
    FOR DELETE
    USING (auth.uid() = user_id);
