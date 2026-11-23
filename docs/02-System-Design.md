# 2. System Design

This document details the software design patterns and system constraints of CineMatch.

## Design Patterns

1. **Factory Pattern (`LLMClient`)**: The AI engine can swap between multiple model providers (Groq, OpenAI, Anthropic) seamlessly. The core `ConversationService` does not know which provider is being used.
2. **Strategy Pattern (`RecommendationService`)**: Filtering and Candidate Generation strategies are dynamically loaded. The Recommendation Engine does not differentiate between standard user browsing and an AI-constrained query.
3. **Repository Pattern (`Supabase`)**: The frontend interacts directly with Supabase for CRUD operations (Favorites, Watchlist), saving backend compute. The Backend only queries Supabase when hydrating ML state or tracking analytics.

## Constraints & Considerations

- **Cache Poisoning**: The AI Picks endpoints deliberately *bypass* the standard Recommendation Cache. If a user asks for "Depressing Documentaries," we do not want to cache this state and ruin their default homepage recommendations.
- **Latency**: Because AI Picks requires 2 round trips to Groq and 1 pass through the ML Engine, we leverage Groq's LPU hardware to keep full response times under 2 seconds.
- **Statelessness**: The FastAPI backend is entirely stateless (except for ephemeral LRU caches) allowing horizontal scaling in production.
