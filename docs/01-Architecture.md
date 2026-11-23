# 1. CineMatch Architecture

CineMatch is built as a modern, decoupled three-tier application that leverages serverless managed databases alongside a scalable microservice backend for computationally expensive ML operations.

## High Level Architecture

1. **Frontend (React + Vite)**: Handles user interaction, state management, and optimistic UI updates.
2. **AI & Recommendation Engine (FastAPI)**: A dedicated Python backend responsible for all recommendation filtering, caching, and intent orchestration.
3. **Database (Supabase / PostgreSQL)**: Stores structured user data, preferences, and tracking events.
4. **LLM Provider (Groq)**: The engine powering the Conversational AI Assistant.

## The Request Lifecycle

### Standard Recommendation
1. User visits `/recommendations`.
2. React fetches `GET /api/recommendations`.
3. FastAPI checks local TTL cache.
4. On miss, `CandidateGenerator` queries Supabase for favorites.
5. Recommendation matrix is computed and scored.
6. Movies returned to React.

### AI Picks Recommendation
1. User types in natural language on `/ai-picks`.
2. `ConversationService` uses `LLMClient` to ping Groq to extract JSON Intent.
3. Intent is parsed into `RecommendationRequest`.
4. `RecommendationService` applies AI-specific temporary filters (e.g. genre constraints, year bounds).
5. Generator and Ranker run constrained by AI intent.
6. Candidate list is sent *back* to Groq to generate a human-readable explanation.
7. Final conversational response and movie payload sent back to React.
