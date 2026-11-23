from pydantic import BaseModel, Field
from typing import List, Optional

class UserTasteProfile(BaseModel):
    # Raw Movie Lists
    favorite_movie_ids: List[int] = Field(default_factory=list)
    rated_movie_ids: List[int] = Field(default_factory=list)
    highly_rated_movie_ids: List[int] = Field(default_factory=list)
    watchlist_movie_ids: List[int] = Field(default_factory=list)
    recent_movie_ids: List[int] = Field(default_factory=list)
    
    # Learned Profile (from the user's movie history)
    favorite_genres: List[str] = Field(default_factory=list)
    genre_distribution: dict = Field(default_factory=dict)
    favorite_directors: List[str] = Field(default_factory=list)
    favorite_actors: List[str] = Field(default_factory=list)
    
    # Explicit preferences (from user_preferences table)
    preferred_languages: List[str] = Field(default_factory=list)
    countries: List[str] = Field(default_factory=list)
    include_adult: bool = False
    
    # Cooldown movies (shown recently to exclude from recommendations)
    cooldown_movie_ids: List[int] = Field(default_factory=list)

