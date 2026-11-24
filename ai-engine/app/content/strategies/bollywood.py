from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage
from app.content.services.tmdb_live_service import tmdb_live_service

class BollywoodStrategy(BaseDiscoveryStrategy):
    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # Load curated popular Bollywood & Indian cinema blockbusters
        data = tmdb_live_service.get_bollywood_movies(page=page, page_size=page_size, category="popular")
        raw_movies = data.get("results", [])
        
        movies = [{"id": int(m["id"])} for m in raw_movies]
        total_movies = data.get("total_results", len(movies))
        total_pages = data.get("total_pages", 1)
        has_more = page < total_pages
        next_page = page + 1 if has_more else None
        
        return SectionPage(
            movies=movies,
            page=page,
            page_size=page_size,
            total_movies=total_movies,
            has_more=has_more,
            next_page=next_page
        )
