from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.user_profile import UserTasteProfile
from app.models.recommender_models import CandidateMovie, RecommendationResult

class RecommendationContext(BaseModel):
    profile: UserTasteProfile
    candidates: List[CandidateMovie] = Field(default_factory=list)
    recommendations: List[RecommendationResult] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    model_version: str = "v1"
    recommendation_type: str = "general" # e.g., 'home', 'ai_picks', 'similar'
