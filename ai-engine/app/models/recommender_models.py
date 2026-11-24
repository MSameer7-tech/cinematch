from pydantic import BaseModel, Field
from typing import List, Optional

class CandidateMovie(BaseModel):
    movie_id: int
    base_similarity: float = 0.0
    seed_movie_id: Optional[int] = None
    
    # Ranking scores
    rank_score: float = 0.0
    
    # Metadata for filtering/ranking (populated later)
    genres: List[str] = Field(default_factory=list)
    directors: List[str] = Field(default_factory=list)
    actors: List[str] = Field(default_factory=list)
    release_year: Optional[int] = None
    status: Optional[str] = None
    popularity: float = 0.0
    vote_average: float = 0.0
    vote_count: float = 0.0
    metadata_score: int = 0
    adult: bool = False
    spoken_languages: List[str] = Field(default_factory=list)

class RecommendationResult(BaseModel):
    movie_id: int
    score: float
    reasons: List[str] = Field(default_factory=list)
