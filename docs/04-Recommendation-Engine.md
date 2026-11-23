# 4. Recommendation Engine

The core value proposition of CineMatch is its hybrid recommendation engine.

## Why TF-IDF over Embeddings?
For our dataset (4,600 movies), full deep learning embeddings (e.g. BERT/OpenAI) represent overkill and introduce unacceptable latency and infrastructure complexity. We implemented a custom TF-IDF (Term Frequency - Inverse Document Frequency) cosine similarity matrix across movie genres, cast, and keywords. This provides deterministic, interpretable, and highly performant (O(1) lookups via in-memory dicts) similarity scoring.

## The Pipeline

1. **Candidate Generation**
   - Extracts a user's recent highly-rated movies and favorites.
   - Looks up the top 30 most similar movies from the pre-computed similarity matrix.
   - Results in a candidate pool of ~200 movies.

2. **Candidate Filtering**
   - Eliminates movies the user has already seen (Watchlist/Ratings).
   - If triggered via `AI Picks`, strictly eliminates movies that violate the user's natural language constraints (e.g., `< 120 runtime`).

3. **Ranking Engine**
   - The Brain of CineMatch. Scores every candidate:
     - 40% Similarity Score
     - 25% TMDB Global Ratings
     - 15% Explicit User Feedback (Likes/Dislikes)
     - 20% Personal Preferences Match

4. **Diversity Engine**
   - Enforces a genre spread so the user is not overwhelmed with 20 movies from the exact same franchise.
