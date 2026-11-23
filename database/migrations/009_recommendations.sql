-- 009_recommendations.sql
-- Create tracking tables for recommendation feedback and events

-- 1. Recommendation Feedback Table
CREATE TABLE public.recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    movie_id INT NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('LIKE', 'DISLIKE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, movie_id)
);

-- Enable RLS for recommendation_feedback
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own recommendation feedback" 
    ON public.recommendation_feedback FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "Users can view own recommendation feedback" 
    ON public.recommendation_feedback FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own recommendation feedback" 
    ON public.recommendation_feedback FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete own recommendation feedback" 
    ON public.recommendation_feedback FOR DELETE 
    USING (auth.uid() = user_id);


-- 2. Recommendation Events Table
CREATE TABLE public.recommendation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, 
    movie_id INT, -- NULL for events like 'generated'
    recommendation_score NUMERIC, -- Capture score at time of interaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for recommendation_events
ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own recommendation events" 
    ON public.recommendation_events FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own events
CREATE POLICY "Users can view own recommendation events" 
    ON public.recommendation_events FOR SELECT 
    USING (auth.uid() = user_id);

-- Indexes for fast analytics queries
CREATE INDEX idx_recommendation_feedback_user_movie ON public.recommendation_feedback(user_id, movie_id);
CREATE INDEX idx_recommendation_events_user_id ON public.recommendation_events(user_id);
CREATE INDEX idx_recommendation_events_type_time ON public.recommendation_events(event_type, created_at);
