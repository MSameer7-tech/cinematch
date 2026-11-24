from typing import List
from app.models.recommender_models import CandidateMovie
from app.models.user_profile import UserTasteProfile
from app.recommender.scoring.similarity_scorer import SimilarityScorer
from app.recommender.scoring.novelty_scorer import NoveltyScorer
from app.recommender.scoring.freshness_scorer import FreshnessScorer
from app.recommender.scoring.popularity_scorer import PopularityScorer

# Try importing centralized weights, fall back if not found
try:
    from app.content.config import SCORING_WEIGHTS
except ImportError:
    SCORING_WEIGHTS = {
        "similarity": 0.60,
        "novelty": 0.20,
        "freshness": 0.10,
        "popularity": 0.10
    }

class CompositeScorer:
    def __init__(self):
        self.similarity_scorer = SimilarityScorer()
        self.novelty_scorer = NoveltyScorer()
        self.freshness_scorer = FreshnessScorer()
        self.popularity_scorer = PopularityScorer()
        self.weights = SCORING_WEIGHTS

    def score_candidates(self, candidates: List[CandidateMovie], profile: UserTasteProfile) -> None:
        """
        Computes composite score for candidates and stores in rank_score in-place.
        """
        if not candidates:
            return
            
        max_pop = max([float(c.popularity) for c in candidates]) if candidates else 1.0
        if max_pop == 0.0:
            max_pop = 1.0
            
        for c in candidates:
            sim = self.similarity_scorer.score(c, profile)
            nov = self.novelty_scorer.score(c, max_popularity=max_pop)
            fresh = self.freshness_scorer.score(c)
            pop = self.popularity_scorer.score(c, max_popularity=max_pop)
            
            # Quality factor based on critically verified vote average (scaled 5.0 to 9.0 -> 0.0 to 1.0)
            quality = max(0.0, min(1.0, (c.vote_average - 5.0) / 4.0)) if c.vote_average > 0 else 0.5
            
            raw_score = (
                sim * 0.45 +
                quality * 0.30 +
                pop * 0.15 +
                nov * 0.05 +
                fresh * 0.05
            )
            
            # Calibrate raw score (typically 0.25 to 0.65) into an intuitive match percentage (0.78 to 0.98)
            norm = max(0.0, min(1.0, (raw_score - 0.25) / 0.35))
            calibrated = 0.78 + (norm * 0.20)
            c.rank_score = round(min(calibrated, 0.98), 3)
