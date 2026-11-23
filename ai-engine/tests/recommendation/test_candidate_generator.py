import pytest
from app.recommender.candidate_generator import CandidateGenerator
from app.models.recommendation_context import RecommendationContext
from app.models.user_profile import UserTasteProfile

def test_candidate_generator_initialization():
    generator = CandidateGenerator()
    assert generator.movies_df is not None
    assert generator.similarity_matrix is not None
    assert generator.movies_df.shape[0] > 0

def test_generate_candidates_with_empty_profile():
    generator = CandidateGenerator()
    profile = UserTasteProfile(user_id="test_user")
    context = RecommendationContext(profile=profile)
    
    # If no favorites/ratings, should fallback to popular movies or random
    generator.generate_candidates(context)
    
    assert len(context.candidates) > 0
    # Make sure candidates are unique
    movie_ids = [c.movie.id for c in context.candidates]
    assert len(movie_ids) == len(set(movie_ids))
