from typing import Optional, Any, List
from app.models.recommendation_request import RecommendationRequest
from app.ai.schemas.intent_schema import IntentSchema
from app.content.repositories.movie_repository import MovieRepository

_movie_repo = None

def get_movie_repo():
    global _movie_repo
    if _movie_repo is None:
        _movie_repo = MovieRepository()
    return _movie_repo

GENRE_MAP = {
    "sci-fi": "Science Fiction",
    "scifi": "Science Fiction",
    "science-fiction": "Science Fiction",
    "rom-com": "Romance",
    "romcom": "Romance",
}

class RecommendationRequestBuilder:
    @staticmethod
    def build(user_id: str, intent_data: IntentSchema, taste_doc: Optional[Any] = None) -> RecommendationRequest:
        """
        Translates an LLM Intent into a strict RecommendationRequest for the engine.
        Enriches with taste profile data if user didn't specify explicit filters.
        Resolves reference movie titles to seed movie IDs.
        """
        preferred_genres = []
        for g in (intent_data.preferred_genres or []):
            mapped = GENRE_MAP.get(g.lower().strip(), g.strip().title())
            preferred_genres.append(mapped)

        excluded_genres = [g.strip().title() for g in (intent_data.excluded_genres or [])]
        
        if taste_doc:
            if not preferred_genres:
                genres_list = getattr(taste_doc, "top_genres", None) or getattr(taste_doc, "genre_affinities", None)
                if genres_list:
                    preferred_genres = [g["genre"] for g in genres_list[:3] if isinstance(g, dict) and "genre" in g]
            if not excluded_genres and hasattr(taste_doc, "avoid_genres") and taste_doc.avoid_genres:
                excluded_genres = list(taste_doc.avoid_genres)

        # Resolve reference movies to seed movie IDs
        seed_movie_ids: List[int] = []
        if intent_data.reference_movies:
            repo = get_movie_repo()
            df = repo.df
            for ref in intent_data.reference_movies:
                clean = ref.strip().lower()
                if not clean:
                    continue
                exact = df[df['title'].str.lower() == clean]
                if not exact.empty:
                    seed_movie_ids.append(int(exact.iloc[0]['movie_id']))
                else:
                    partial = df[df['title'].str.lower().str.contains(clean, regex=False, na=False)]
                    if not partial.empty:
                        best = partial.sort_values(by='vote_count', ascending=False).iloc[0]
                        seed_movie_ids.append(int(best['movie_id']))

        effective_intent = "similar" if seed_movie_ids else ("recommend" if intent_data.intent == "taste_profile" else intent_data.intent)

        req = RecommendationRequest(
            user_id=user_id,
            intent=effective_intent,
            limit=5, # Top 5 relevant picks
            exclude_seen=True,
            seed_movies=seed_movie_ids,
            preferred_genres=preferred_genres,
            excluded_genres=excluded_genres,
        )
        
        if intent_data.runtime and intent_data.runtime.max:
            req.runtime_max = intent_data.runtime.max
            
        if intent_data.year_range:
            req.year_min = intent_data.year_range.start
            req.year_max = intent_data.year_range.end
            
        return req
