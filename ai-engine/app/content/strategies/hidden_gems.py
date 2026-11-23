from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage
from app.content.repositories.movie_repository import MovieRepository

class HiddenGemsStrategy(BaseDiscoveryStrategy):
    def __init__(self):
        self.movie_repo = MovieRepository()

    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # Load all precomputed sorted hidden gems
        gems = self.movie_repo.get_hidden_gems()
        total_movies = len(gems)
        
        start_idx = (page - 1) * page_size
        end_idx = page * page_size
        
        sliced_movies = gems[start_idx:end_idx]
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
