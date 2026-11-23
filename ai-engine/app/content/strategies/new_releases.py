from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage
from app.content.repositories.movie_repository import MovieRepository
from app.content.services.tmdb_live_service import tmdb_live_service

class NewReleasesStrategy(BaseDiscoveryStrategy):
    def __init__(self):
        self.movie_repo = MovieRepository()

    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # 1. First attempt to fetch real-time newly released movies from TMDB (now_playing)
        try:
            live_data = tmdb_live_service.get_new_releases(page=page)
            if live_data and live_data.get("results"):
                movies = [{"id": int(m["id"])} for m in live_data["results"]]
                total_movies = live_data.get("total_results", len(movies))
                has_more = page < live_data.get("total_pages", 1)
                next_page = page + 1 if has_more else None
                return SectionPage(
                    movies=movies,
                    page=page,
                    page_size=page_size,
                    total_movies=total_movies,
                    has_more=has_more,
                    next_page=next_page
                )
        except Exception:
            pass

        # 2. Fallback to local repository precomputed new releases
        releases = self.movie_repo.get_new_releases()
        total_movies = len(releases)
        
        start_idx = (page - 1) * page_size
        end_idx = page * page_size
        
        sliced_movies = releases[start_idx:end_idx]
        has_more = end_idx < total_movies
        next_page = page + 1 if has_more else None
        
        movies = [{"id": int(m["movie_id"])} for m in sliced_movies]
        
        return SectionPage(
            movies=movies,
            page=page,
            page_size=page_size,
            total_movies=total_movies,
            has_more=has_more,
            next_page=next_page
        )
