# 13. AI Picks Architecture (CineMatch)

This document serves as the architecture contract for the AI Picks module, defining the schemas, boundaries, and lifecycles between the frontend, the recommendation engine, and the LLM.

## 1. Supported User Intents
The LLM Intent Parser categorizes all incoming user queries into one of the following canonical intents. The `RecommendationRequestBuilder` translates these intents into actionable queries against the recommendation engine.

- **`recommend`**: Standard discovery query based on mood, genre, or constraints (e.g., "Show me something happy under 2 hours").
- **`similar`**: Recommendation anchored heavily to reference movies (e.g., "Movies like Interstellar but not depressing").
- **`compare`**: Evaluates two or more movies (e.g., "Should I watch The Godfather or Goodfellas?").
- **`explain`**: Asks why a specific movie was recommended (e.g., "Why did you suggest Dune?").
- **`discover`**: Extremely broad queries or "surprise me" inputs.
- **`irrelevant`**: Small talk or non-movie queries (handled gracefully via the LLM safety layer).

## 2. Intent Parser JSON Schema
The LLM is prompted to output a strict JSON payload adhering to this schema:
```json
{
  "intent": "recommend|similar|compare|explain|discover|irrelevant",
  "reference_movies": ["string"],
  "preferred_genres": ["string"],
  "excluded_genres": ["string"],
  "mood": "string | null",
  "runtime": {
    "min": "number | null",
    "max": "number | null"
  },
  "language": "string | null",
  "year_range": {
    "start": "number | null",
    "end": "number | null"
  },
  "family_friendly": "boolean | null",
  "streaming_service": "string | null"
}
```

## 3. Unified Recommendation Request
To prevent polluting `RecommendationService` with disparate arguments, all requests (from AI, Home Page, or trending) are wrapped in a unified request model.

```python
class RecommendationRequest(BaseModel):
    user_id: str
    intent: str = "recommend"
    limit: int = 20
    exclude_seen: bool = True
    seed_movies: List[int] = [] # Hard-anchors for 'similar' intent
    
    # Temporary Filters (Overrides user taste profile temporarily)
    preferred_genres: List[str] = []
    excluded_genres: List[str] = []
    runtime_max: Optional[int] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
```

## 4. API Request/Response Contracts

**`POST /api/ai/chat`**
*Request:*
```json
{
  "conversation_id": "uuid-string",
  "message": "Recommend something like Inception but funny."
}
```
*Response:*
```json
{
  "conversation_id": "uuid-string",
  "reply": "I've found some great mind-bending comedies for you.",
  "movies": [
    {
      "movie": { "id": 1, "title": "Everything Everywhere All at Once", ... },
      "score": 0.95,
      "reasons": ["Similar themes to Inception", "Action Comedy genre"]
    }
  ]
}
```

## 5. Conversation Lifecycle & Memory
- **Ownership**: The backend owns conversation memory. The frontend never sends raw history.
- **Storage**: In-memory backend cache (e.g., `dict` or Redis eventually) keyed by `conversation_id`.
- **Expiration**: TTL of 30 minutes since the last message.
- **Windowing**: A rolling window of 8 raw messages. Once exceeded, the LLM is prompted (using `summary_prompt`) to summarize messages 1-8 into a block, which then becomes message 1 in the new window.
- **Long-term Preferences**: "I don't like horror" translates to an update in the user's permanent `User Preferences` table, *not* in the chat session history.

## 6. Error Handling & Fallbacks
- **LLM Timeout/Down**: Respond with standard fallback: "I'm having trouble thinking right now, but here are some general recommendations for you." and bypass the intent parser.
- **JSON Parsing Failure**: Retries once using a corrective prompt. If it fails again, falls back to `discover` intent using user profile defaults.
- **No Movies Found**: Relax the temporary filters sequentially (e.g., drop runtime, then drop year range) and re-query the recommendation engine before generating the LLM explanation.
