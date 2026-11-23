from pydantic import BaseModel, Field
from typing import List, Optional

class RuntimeRange(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None

class YearRange(BaseModel):
    start: Optional[int] = None
    end: Optional[int] = None

class IntentSchema(BaseModel):
    intent: str = Field(..., description="recommend|similar|compare|explain|discover|taste_profile|irrelevant")
    reference_movies: List[str] = Field(default_factory=list)
    preferred_genres: List[str] = Field(default_factory=list)
    excluded_genres: List[str] = Field(default_factory=list)
    mood: Optional[str] = None
    runtime: Optional[RuntimeRange] = None
    language: Optional[str] = None
    year_range: Optional[YearRange] = None
    family_friendly: Optional[bool] = None
    streaming_service: Optional[str] = None
