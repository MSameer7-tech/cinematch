from pydantic import BaseModel

class RankingWeights(BaseModel):
    similarity: float = 0.40
    genre_match: float = 0.30
    cast_crew_match: float = 0.20
    freshness_bonus_max: float = 0.05
    popularity_bonus_max: float = 0.05
