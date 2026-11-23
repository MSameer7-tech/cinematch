from pydantic import BaseModel
from typing import List, Optional

class RecommendationRequest(BaseModel):
    user_id: str
    intent: str = "recommend"
    limit: int = 20
    exclude_seen: bool = True
    seed_movies: List[int] = [] 
    
    # Temporary Filters (Overrides user taste profile temporarily)
    preferred_genres: List[str] = []
    excluded_genres: List[str] = []
    runtime_max: Optional[int] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
