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
            
            raw_score = (
                sim * self.weights.get("similarity", 0.60) +
                nov * self.weights.get("novelty", 0.20) +
                fresh * self.weights.get("freshness", 0.10) +
                pop * self.weights.get("popularity", 0.10)
            )
            
            # Calibrate raw score (typically 0.20 to 0.50) into an intuitive, high-affinity match percentage (0.75 to 0.98)
            norm = max(0.0, min(1.0, (raw_score - 0.20) / 0.30))
            calibrated = 0.75 + (norm * 0.23)
            c.rank_score = round(min(calibrated, 0.98), 3)
