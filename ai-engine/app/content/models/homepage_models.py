from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Dict, Any, Optional

class SectionPage(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    movies: List[Dict[str, Any]]
    page: int
    page_size: int
    total_movies: int
    has_more: bool
    next_page: Optional[int] = None
    custom_title: Optional[str] = None

class HomepageSection(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    id: str
    title: str
    subtitle: Optional[str] = None
    section_type: str
    priority: int
    strategy: str
    page: int = 1
    page_size: int = 20
    total_movies: int = 0
    has_more: bool = False
    next_page: Optional[int] = None
    movies: List[Dict[str, Any]] = Field(default_factory=list)

class HomepageResponse(BaseModel):
    hero: Optional[Dict[str, Any]] = None
    hero_movies: List[Dict[str, Any]] = Field(default_factory=list)
    persona_title: Optional[str] = None
    sections: List[HomepageSection] = Field(default_factory=list)
    generated_at: str
    cache_until: str
    version: str = "v1"
    request_id: str

class HomepageContext(BaseModel):
    user_id: str
    today: str # Format: YYYY-MM-DD
    rotation_seed: int
    timezone: str = "UTC"
    locale: str = "en-US"
    favorite_genres: List[str] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    favorites: List[int] = Field(default_factory=list)
    watchlist: List[int] = Field(default_factory=list)
    recently_viewed: List[int] = Field(default_factory=list)
    highly_rated: List[int] = Field(default_factory=list)
    recommendation_history: List[Dict[str, Any]] = Field(default_factory=list)
    taste_profile: Optional[Dict[str, Any]] = None

class RecommendationPool(BaseModel):
    movies: List[Dict[str, Any]]
    generated_at: str
    expires_at: str
