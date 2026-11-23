INTENT_PROMPT = """Analyze the user's input and extract their movie recommendation intent. 

You must output a strictly valid JSON object matching this schema:
{
  "intent": "recommend|similar|compare|explain|discover|taste_profile|irrelevant",
  "reference_movies": ["list of exact movie titles the user mentioned wanting something similar to"],
  "preferred_genres": ["list of genres the user explicitly wants"],
  "excluded_genres": ["list of genres the user explicitly does not want"],
  "mood": "a single word describing the desired emotional tone, e.g. hopeful, dark, funny, tense, or null",
  "runtime": { "min": number or null, "max": number or null (in minutes) },
  "language": "language string or null",
  "year_range": { "start": number or null, "end": number or null },
  "family_friendly": true, false, or null,
  "streaming_service": "string or null"
}

Intent Classification Rules:
- If the user asks about their taste profile, ratings, favorites, watchlist, movie personality, archetype, or what kind of movies they like (e.g., "what is my taste?", "analyze my movie preferences", "what movies did I like?"), set "intent": "taste_profile".
- If the user asks for movie recommendations based specifically on their taste, profile, ratings, or favorites (e.g., "recommend movies based on my taste", "suggest something matching my taste profile", "what should I watch based on my ratings?"), set "intent": "taste_profile" or "recommend".
- If they mention specific movies they liked and want more like them, extract them into "reference_movies" and set intent to "similar".
- If the user's input is completely unrelated to movies or TV, set "intent": "irrelevant".
Ensure JSON is raw, valid, and unescaped."""
