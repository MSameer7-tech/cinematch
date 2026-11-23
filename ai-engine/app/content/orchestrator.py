import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Optional

from app.content.config import HOMEPAGE_SECTIONS, HERO_STRATEGY_PRIORITY
from app.content.models.homepage_models import HomepageContext, HomepageSection, HomepageResponse
from app.content.strategies.continue_watching import ContinueWatchingStrategy
from app.content.strategies.recommended import RecommendedForYouStrategy
from app.content.strategies.because_you_liked import BecauseYouLikedStrategy
from app.content.strategies.hidden_gems import HiddenGemsStrategy
from app.content.strategies.trending import TrendingStrategy
from app.content.strategies.new_releases import NewReleasesStrategy
from app.content.strategies.explore import ExploreStrategy

class HomepageOrchestrator:
    def __init__(self):
        # Register strategy instances
        self.strategies = {
            "continue_watching": ContinueWatchingStrategy(),
            "recommended": RecommendedForYouStrategy(),
            "because_you_liked": BecauseYouLikedStrategy(),
            "hidden_gems": HiddenGemsStrategy(),
            "trending": TrendingStrategy(),
            "new_releases": NewReleasesStrategy(),
            "explore": ExploreStrategy()
        }

    async def build_homepage(self, context: HomepageContext, experiment_group: Optional[str] = None) -> HomepageResponse:
        request_id = uuid.uuid4().hex
        generated_at = datetime.utcnow()
        
        # Static sections cache for 6 hours, personal for 10 minutes
        # We find the earliest cache expiry time
        cache_expiry = generated_at + timedelta(minutes=10)
        cache_until = cache_expiry.isoformat() + "Z"

        # 1. Filter enabled configs and those matching the experiment group (Phase 11)
        active_configs = []
        for config in HOMEPAGE_SECTIONS:
            if not config.enabled:
                continue
            if config.experiment_group and config.experiment_group != experiment_group:
                continue
            active_configs.append(config)

        # 2. Run active strategies concurrently
        tasks = []
        for config in active_configs:
            strategy = self.strategies.get(config.strategy_name)
            if strategy:
                # Default page 1, page size 20 (or 10 for continue watching)
                page_size = 10 if config.strategy_name == "continue_watching" else 20
                tasks.append(strategy.generate(context, page=1, page_size=page_size))
            else:
                tasks.append(asyncio.sleep(0, default=None)) # Dummy task

        results = await asyncio.gather(*tasks)

        # 3. Process results
        sections = []
        section_results_dict = {} # strategy_name -> movies list
        
        for config, result in zip(active_configs, results):
            if result is None:
                continue

            # Skip empty sections (Phase 11 / Section Ranking)
            if not result.movies:
                continue

            section_title = result.custom_title or config.title
            
            section_results_dict[config.strategy_name] = result.movies

            sections.append(HomepageSection(
                id=config.strategy_name,
                title=section_title,
                subtitle=config.subtitle,
                section_type=config.cache_type,
                priority=config.priority,
                strategy=config.strategy_name,
                page=result.page,
                page_size=result.page_size,
                total_movies=result.total_movies,
                has_more=result.has_more,
                next_page=result.next_page,
                movies=result.movies
            ))

        # Sort sections by priority
        sections.sort(key=lambda s: s.priority)

        # 4. Personalized Dynamic Hero Selection using User Taste Profile
        from app.services.detail_engine import detail_engine

        hero_candidates = []
        seen_candidate_ids = set()

        for strat in ["recommended", "because_you_liked", "hidden_gems", "trending", "new_releases"]:
            for m in section_results_dict.get(strat, []):
                mid = m.get("id")
                if mid and mid not in seen_candidate_ids:
                    seen_candidate_ids.add(mid)
                    hero_candidates.append(m)

        hero_movies = detail_engine.rank_hero_candidates(context.user_id, hero_candidates, limit=8)
        hero_movie = hero_movies[0] if hero_movies else None

        # Fallback if no hero was selected
        if not hero_movie and sections and sections[0].movies:
            hero_movie = sections[0].movies[0]
            hero_movies = [hero_movie]

        persona_title = context.taste_profile.get("persona_title") if context.taste_profile else None

        return HomepageResponse(
            hero=hero_movie,
            hero_movies=hero_movies,
            persona_title=persona_title,
            sections=sections,
            generated_at=generated_at.isoformat() + "Z",
            cache_until=cache_until,
            version="v1",
            request_id=request_id
        )
