# 5. AI Picks Assistant

CineMatch integrates LLMs safely using a **Deterministic LLM Architecture**.

## The Problem
If you ask an LLM to "Recommend me a movie," it hallucinates titles, suggests movies you've already seen, and completely ignores your historical taste profile.

## The Solution
We do **not** let the LLM choose the movies. We use the LLM purely as an NLP router and explainer.

1. **The Intent Parser**
   User says: *"Show me a sci-fi movie under 2 hours that isn't depressing."*
   The `LLMClient` uses `INTENT_PROMPT` to output strict JSON:
   ```json
   {
     "intent": "recommend",
     "preferred_genres": ["Science Fiction"],
     "mood": "upbeat",
     "runtime": {"max": 120}
   }
   ```

2. **The Builder**
   This JSON is converted into a structured `RecommendationRequest`. The standard Python TF-IDF Ranking Engine takes over, guaranteeing the recommendations actually exist in the database, match the user's hidden favorites, and haven't been watched before.

3. **The Explanation Engine**
   Once the Python Engine selects the top 5 movies, their metadata is injected back into an `EXPLANATION_PROMPT`. The LLM generates human-readable reasoning for *why* the Python Engine chose those movies.

## Recursive Memory
To handle chat history efficiently, the backend utilizes a sliding window memory buffer. Once a conversation exceeds 8 messages, a background summarization prompt compresses the history into a single dense system instruction.
