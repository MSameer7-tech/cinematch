import pandas as pd
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.recommendation_context import RecommendationContext
from app.models.recommender_models import RecommendationResult
from app.config import PROCESSED_DATA_DIR, DATA_VERSION

class ExplanationEngine:
    def __init__(self):
        from app.config import get_movie_features_df
        df = get_movie_features_df()
        self.movie_titles = {row['movie_id']: row['title'] for idx, row in df.iterrows()}
        
    def generate_explanations(self, context: RecommendationContext) -> None:
        profile = context.profile
        
        for candidate in context.candidates:
            reasons = []
            
            # 1. Similarity / Seed Movie Context
            if candidate.seed_movie_id:
                seed_title = self.movie_titles.get(candidate.seed_movie_id, "this movie")
                if candidate.seed_movie_id in profile.favorite_movie_ids or candidate.seed_movie_id in profile.highly_rated_movie_ids:
                    reasons.append(f"Because you liked {seed_title}")
                elif candidate.seed_movie_id in profile.watchlist_movie_ids:
                    reasons.append(f"Similar to watchlist item: {seed_title}")
                elif candidate.seed_movie_id in profile.recent_movie_ids:
                    reasons.append(f"Because you recently viewed {seed_title}")
                else:
                    reasons.append(f"Similar to {seed_title}")
                
            # 2. Directors
            if candidate.directors and profile.favorite_directors:
                for d in candidate.directors:
                    if d in profile.favorite_directors:
                        reasons.append(f"{d} is one of your favorite directors")
                        break
                        
            # 3. Actors
            if candidate.actors and profile.favorite_actors:
                for a in candidate.actors:
                    if a in profile.favorite_actors:
                        reasons.append(f"Features {a}")
                        break
                        
            # 4. Genres
            if candidate.genres and profile.favorite_genres:
                for g in candidate.genres:
                    if g in profile.favorite_genres[:3]: # Only mention top 3 genres
                        reasons.append(f"You frequently watch {g}")
                        break
                        
            # 5. Freshness
            if candidate.release_year and (2026 - candidate.release_year) <= 2:
                reasons.append("New release")
                
            result = RecommendationResult(
                movie_id=candidate.movie_id,
                score=candidate.rank_score,
                reasons=reasons
            )
            context.recommendations.append(result)
