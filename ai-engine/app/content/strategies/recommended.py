import hashlib
import time
from datetime import datetime, timedelta
from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage
from app.content.repositories.recommendation_repository import RecommendationRepository
from app.cache.recommendation_cache import recommendation_cache

class RecommendedForYouStrategy(BaseDiscoveryStrategy):
    def __init__(self):
        self.rec_repo = RecommendationRepository()

    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # 1. Access/populate recommendation pool cache
        cache_key = f"pool:{context.user_id}"
        pool = recommendation_cache.store.get(cache_key)
        now = datetime.utcnow()
        
        if pool is None or pool["expires_at"] < time.time():
            # Generate Top 500 pool (Phase 5)
            recs = self.rec_repo.get_personalized_recommendations(context.user_id, limit=500)
            if not recs:
                recs = []
            
            # Store in cached dictionary matching RecommendationPool schema properties
            pool = {
                "movies": recs,
                "generated_at": now.isoformat(),
                "expires_at": time.time() + 15 * 60
            }
            recommendation_cache.store[cache_key] = pool
            
        recs = pool["movies"]
        total_movies = len(recs)
        
        if total_movies == 0:
            return SectionPage(
                movies=[],
                page=page,
                page_size=page_size,
                total_movies=0,
                has_more=False
            )
            
        # 2. Sort recommendations strictly by score descending (highest liking rate first)
        recs.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        # 3. Slice the requested page from the top-rated recommendations
        start_page_idx = (page - 1) * page_size
        end_page_idx = page * page_size
        
        sliced_recs = recs[start_page_idx:end_page_idx]
        has_more = end_page_idx < total_movies
        next_page = page + 1 if has_more else None
        
        movies = [{"id": r["movie_id"], "score": r["score"], "reasons": r["reasons"]} for r in sliced_recs]
        
        return SectionPage(
            movies=movies,
            page=page,
            page_size=page_size,
            total_movies=total_movies,
            has_more=has_more,
            next_page=next_page
        )
