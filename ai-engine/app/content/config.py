from pydantic import BaseModel
from typing import List, Optional

class SectionConfig(BaseModel):
    strategy_name: str
    title: str
    subtitle: Optional[str] = None
    priority: int
    enabled: bool = True
    cache_type: str = "personal" # "personal" or "static"
    experiment_group: Optional[str] = None # Optional experiment group A/B/C

# Homepage section configurations
HOMEPAGE_SECTIONS = [
    SectionConfig(
        strategy_name="continue_watching",
        title="Continue Watching",
        subtitle="Pick up where you left off",
        priority=1,
        enabled=True,
        cache_type="personal"
    ),
    SectionConfig(
        strategy_name="recommended",
        title="Recommended For You",
        subtitle="Tailored matches just for you",
        priority=2,
        enabled=True,
        cache_type="personal"
    ),
    SectionConfig(
        strategy_name="bollywood",
        title="Bollywood Hits",
        subtitle="Popular blockbusters and acclaimed Indian cinema",
        priority=3,
        enabled=True,
        cache_type="static"
    ),
    SectionConfig(
        strategy_name="because_you_liked",
        title="Because You Liked",
        subtitle="Similar to your top picks",
        priority=4,
        enabled=True,
        cache_type="personal"
    ),
    SectionConfig(
        strategy_name="hidden_gems",
        title="Hidden Gems",
        subtitle="Under-the-radar high ratings",
        priority=5,
        enabled=True,
        cache_type="static"
    ),
    SectionConfig(
        strategy_name="trending",
        title="Trending Now",
        subtitle="Most popular choices today",
        priority=6,
        enabled=True,
        cache_type="static"
    ),
    SectionConfig(
        strategy_name="explore",
        title="Explore Something New",
        subtitle="Dive into adjacent genres",
        priority=7,
        enabled=True,
        cache_type="personal"
    ),
    SectionConfig(
        strategy_name="new_releases",
        title="New Releases",
        subtitle="Fresh cinema arrivals",
        priority=8,
        enabled=True,
        cache_type="static"
    )
]

# Cooldown Configuration
COOLDOWN_DAYS = 30
MAX_REPEAT_PER_MONTH = 3

# Hero Section Ordering Priority
HERO_STRATEGY_PRIORITY = ["continue_watching", "recommended", "trending", "popular"]

# Scoring Weights for CompositeScorer (Phase 6)
SCORING_WEIGHTS = {
    "similarity": 0.60,
    "novelty": 0.20,
    "freshness": 0.10,
    "popularity": 0.10
}

