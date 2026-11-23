from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Dict, Any, Optional

class SearchIndexItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    id: int
    title: str
    original_title: str
    alternative_titles: List[str] = Field(default_factory=list)
    genres: List[str] = Field(default_factory=list)
    cast: List[str] = Field(default_factory=list)
    director: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    popularity: float
    vote_count: int
    vote_average: float
    release_year: int
    language: str
    runtime: Optional[int] = None
    production_countries: List[str] = Field(default_factory=list)
    adult: bool
    media_type: str = "movie"

class SearchBootstrapResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    movies: List[SearchIndexItem] = Field(default_factory=list)
    genres: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    years: List[int] = Field(default_factory=list)

class AISearchRequest(BaseModel):
    query: str

class AISearchResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    type: str  # "filter" or "recommendation"
    genres: List[str] = Field(default_factory=list)
    runtime_max: Optional[int] = None
    rating_min: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)
    language: Optional[str] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    seed_movies: List[str] = Field(default_factory=list)
    mood: Optional[str] = None
