from app.recommender.recommendation_service import RecommendationService
from app.models.recommendation_request import RecommendationRequest

class RecommendationRepository:
    def __init__(self):
        self.service = RecommendationService()

    def get_personalized_recommendations(self, user_id: str, limit: int = 200, seed_movies: list = None, preferred_genres: list = None) -> list:
        """
        Invokes RecommendationService with custom request profiles.
        """
        request = RecommendationRequest(
            user_id=user_id,
            limit=limit,
            seed_movies=seed_movies or [],
            preferred_genres=preferred_genres or []
        )
        # Returns a list of dicts: [{'movie_id': ..., 'score': ..., 'reasons': ...}]
        return self.service.get_recommendations(request)
