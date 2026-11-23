from app.models.recommendation_context import RecommendationContext
from app.recommender.scoring.composite_scorer import CompositeScorer

class RankingEngine:
    def __init__(self, weights=None):
        # We delegate scoring completely to CompositeScorer
        self.composite_scorer = CompositeScorer()

    def rank_candidates(self, context: RecommendationContext) -> None:
        # Score all candidates using the composite scorer
        self.composite_scorer.score_candidates(context.candidates, context.profile)
        
        # Sort candidates descending by the computed score
        context.candidates.sort(key=lambda x: x.rank_score, reverse=True)
