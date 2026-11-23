from app.content.strategies.base_strategy import BaseDiscoveryStrategy
from app.content.models.homepage_models import HomepageContext, SectionPage

class ContinueWatchingStrategy(BaseDiscoveryStrategy):
    async def generate(self, context: HomepageContext, page: int = 1, page_size: int = 20) -> SectionPage:
        # Continue watching is strictly managed on frontend by user's active trailer watch history
        return SectionPage(
            movies=[],
            page=1,
            page_size=page_size,
            total_movies=0,
            has_more=False
        )
