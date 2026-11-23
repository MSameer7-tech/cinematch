# 3. Database Schema (Supabase)

CineMatch relies on a cloud-hosted Supabase PostgreSQL instance.

## Core Tables

1. **`users`** (Managed by Supabase Auth)
   - UUID mapping

2. **`user_preferences`**
   - Stores explicitly declared favorite genres, actors, and directors.

3. **`movie_interactions`**
   - `id` (UUID)
   - `user_id` (UUID)
   - `movie_id` (INT, mapping to TMDB)
   - `interaction_type` (ENUM: 'FAVORITE', 'WATCHLIST', 'RATED')
   - `score` (FLOAT, nullable)

4. **`recommendation_feedback`**
   - `user_id` (UUID)
   - `movie_id` (INT)
   - `feedback_type` (ENUM: 'LIKE', 'DISLIKE')
   - Helps the ML Ranker penalize bad recommendations.

5. **`recommendation_events`**
   - Tracking table for the analytics funnel (Generated -> Shown -> Clicked -> Favorited).

## Access Patterns
- **Frontend** accesses `movie_interactions` and `user_preferences` directly via RLS (Row Level Security) protected Supabase hooks.
- **Backend** uses a service role key to aggregate data across users for similarity matrices and analytics.
