from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage
from app.content.repositories.movie_repository import MovieRepository
from app.content.utils.genre_graph import get_adjacent_genres

class ExploreStrategy(BaseDiscoveryStrategy):
    def __init__(self):
        self.movie_repo = MovieRepository()

    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # Determine the user's favorite genre
        top_genre = "Science Fiction" # Default fallback
        if context.favorite_genres:
            top_genre = context.favorite_genres[0]

        # Get adjacent genres from graph
        adj = get_adjacent_genres(top_genre)
        
        if not adj:
            # Fallback if no mapping exists for this genre
            adj = [("Drama", 0.5), ("Comedy", 0.5)]

        # Fetch all pre-sorted movies from adjacent genres (startup cached)
        genres_to_fetch = [genre for genre, weight in adj]
        all_movies = self.movie_repo.get_movies_by_genres(genres_to_fetch)
        total_movies = len(all_movies)
        
        start_idx = (page - 1) * page_size
        end_idx = page * page_size
        
        sliced_movies = all_movies[start_idx:end_idx]
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
