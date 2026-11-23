# 8. Future Roadmap (v1.1+)

CineMatch v1.0.0 provides a robust, polished baseline. Future minor and major releases will focus on expanding the recommendation capabilities.

## v1.1: Collaborative Filtering
Currently, the Recommendation Engine relies heavily on Content-Based Filtering (Genres, Actors, Plot similarity).
- **Goal**: Implement User-User Collaborative filtering.
- **Why**: "Users who liked The Matrix also liked Fight Club."
- **How**: Utilize the `movie_interactions` table to build a sparse user-item matrix and compute singular value decomposition (SVD) or K-Nearest Neighbors (KNN).

## v1.2: Hybrid Embeddings
TF-IDF is extremely fast, but fails to capture semantic meaning (e.g., "A movie about space" vs "Interstellar exploration").
- **Goal**: Replace the TF-IDF vectorizer with a pre-trained sentence transformer (e.g., `all-MiniLM-L6-v2`).
- **How**: Pre-compute embeddings for all 4,600 movie overviews and store them in Supabase using `pgvector`. Modify `CandidateGenerator` to perform a cosine similarity vector search on the database level.

## v2.0: Multi-Modal AI
- **Goal**: Allow users to upload a screenshot of a movie scene, or record a voice note, and have the AI Picks engine parse it into an `IntentSchema`.
- **How**: Swap the `LLMClient` model to `llama-3.2-11b-vision` or `whisper-large` via the established Provider interface.
