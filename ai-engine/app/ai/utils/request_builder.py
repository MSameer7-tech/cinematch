from typing import Optional, Any
from app.models.recommendation_request import RecommendationRequest
from app.ai.schemas.intent_schema import IntentSchema

class RecommendationRequestBuilder:
    @staticmethod
    def build(user_id: str, intent_data: IntentSchema, taste_doc: Optional[Any] = None) -> RecommendationRequest:
        """
        Translates an LLM Intent into a strict RecommendationRequest for the engine.
        Enriches with taste profile data if user didn't specify explicit filters.
        """
        preferred_genres = list(intent_data.preferred_genres or [])
        excluded_genres = list(intent_data.excluded_genres or [])
        
        if taste_doc:
            if not preferred_genres:
                genres_list = getattr(taste_doc, "top_genres", None) or getattr(taste_doc, "genre_affinities", None)
                if genres_list:
                    preferred_genres = [g["genre"] for g in genres_list[:3] if isinstance(g, dict) and "genre" in g]
            if not excluded_genres and hasattr(taste_doc, "avoid_genres") and taste_doc.avoid_genres:
                excluded_genres = list(taste_doc.avoid_genres)

        req = RecommendationRequest(
            user_id=user_id,
            intent="recommend" if intent_data.intent == "taste_profile" else intent_data.intent,
            limit=5, # Limit AI picks to top 5 highly relevant
            exclude_seen=True,
            preferred_genres=preferred_genres,
            excluded_genres=excluded_genres,
        )
        
        if intent_data.runtime and intent_data.runtime.max:
            req.runtime_max = intent_data.runtime.max
            
        if intent_data.year_range:
            req.year_min = intent_data.year_range.start
            req.year_max = intent_data.year_range.end
            
        return req
