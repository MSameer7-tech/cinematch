import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.recommendation_context import RecommendationContext
from app.models.recommendation_request import RecommendationRequest
from app.cache.recommendation_cache import recommendation_cache
from app.recommender.profile_builder import ProfileBuilder
from app.recommender.candidate_generator import CandidateGenerator
from app.recommender.candidate_filter import CandidateFilter
from app.recommender.ranking_engine import RankingEngine
from app.recommender.diversity_engine import DiversityEngine
from app.recommender.explanation_engine import ExplanationEngine

class RecommendationService:
    def __init__(self):
        # Load heavy objects once in memory
        self.profile_builder = ProfileBuilder()
        self.candidate_generator = CandidateGenerator()
        self.candidate_filter = CandidateFilter()
        self.ranking_engine = RankingEngine()
        self.diversity_engine = DiversityEngine()
        self.explanation_engine = ExplanationEngine()
        
    def get_recommendations(self, request: RecommendationRequest) -> list:
        # For standard requests, check cache first.
        # If there are temporary AI filters, skip caching to avoid polluting normal recommendations.
        is_standard_request = request.intent == "recommend" and not request.preferred_genres and not request.seed_movies and not request.language
        
        if is_standard_request:
            cached_recommendations = recommendation_cache.get(request.user_id)
            if cached_recommendations is not None:
                return cached_recommendations

        # 1. Build Profile
        profile = self.profile_builder.build_profile(request.user_id)
        
        # 2. Init Context
        context = RecommendationContext(profile=profile, request=request)
        
        # 3. Candidate Generation
        self.candidate_generator.generate_candidates(context, request=request)
        
        # Apply temporary filters if present (Simple genre match)
        if request.preferred_genres:
            prefs_lower = [g.lower() for g in request.preferred_genres]
            filtered_candidates = []
            for c in context.candidates:
                genres = [g.lower() for g in c.genres]
                if any(pref in genres for pref in prefs_lower):
                    filtered_candidates.append(c)
            # Only retain matches if genre filter was explicitly requested
            context.candidates = filtered_candidates

        if request.excluded_genres:
            excl_lower = [g.lower() for g in request.excluded_genres]
            context.candidates = [
                c for c in context.candidates 
                if not any(excl in [g.lower() for g in c.genres] for excl in excl_lower)
            ]
        
        # 4. Filter Candidates
        self.candidate_filter.filter_candidates(context)
        
        # 5. Rank Candidates
        self.ranking_engine.rank_candidates(context)
        
        # 6. Enforce Diversity
        self.diversity_engine.enforce_diversity(context, limit=request.limit)
        
        # 7. Generate Explanations
        self.explanation_engine.generate_explanations(context)
        
        # Return serializable dicts
        results = [r.model_dump() for r in context.recommendations]
        
        # Save to cache only if standard request
        if is_standard_request:
            recommendation_cache.set(request.user_id, results)
        
        return results
