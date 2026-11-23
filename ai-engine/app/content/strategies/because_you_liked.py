from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage
from app.content.repositories.movie_repository import MovieRepository

class BecauseYouLikedStrategy(BaseDiscoveryStrategy):
    def __init__(self):
        self.movie_repo = MovieRepository()

    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # 1. Collect potential seeds in priority order (Highest Rated -> Favorites -> Watchlist -> Recently Viewed)
        seen_seeds = set()
        seeds = []
        
        for seed_list in [context.highly_rated, context.favorites, context.watchlist, context.recently_viewed]:
            for sid in seed_list:
                if sid not in seen_seeds:
                    seen_seeds.add(sid)
                    seeds.append(sid)
                    
        if not seeds:
            return SectionPage(
                movies=[],
                page=page,
                page_size=page_size,
                total_movies=0,
                has_more=False
            )
            
        # Get the first seed's title for the custom header title
        first_seed_id = seeds[0]
        first_seed_movie = self.movie_repo.get_movie_by_id(first_seed_id)
        first_seed_title = first_seed_movie.get("title", "your top pick")
        custom_title = f"Because you liked {first_seed_title}"
        
        # 2. Iterate seeds to chain similarity lists and deduplicate
        all_similar_movies = []
        seen_movie_ids = set()
        
        for seed_id in seeds:
            similar = self.movie_repo.get_similar_movies(seed_id, limit=100)
            for m in similar:
                mid = m["movie_id"]
                if mid not in seen_movie_ids:
                    seen_movie_ids.add(mid)
                    all_similar_movies.append(m)
                    
            # Optimization: Stop fetching similarity lists if we have more than enough movies for the page
            if len(all_similar_movies) >= page * page_size + 100:
                break
                
        total_movies = len(all_similar_movies)
        start_idx = (page - 1) * page_size
        end_idx = page * page_size
        
        sliced_movies = all_similar_movies[start_idx:end_idx]
        has_more = end_idx < total_movies
        next_page = page + 1 if has_more else None
        
        movies = [{"id": int(m["movie_id"])} for m in sliced_movies]
        
        return SectionPage(
            movies=movies,
            page=page,
            page_size=page_size,
            total_movies=total_movies,
            has_more=has_more,
            next_page=next_page,
            custom_title=custom_title
        )
