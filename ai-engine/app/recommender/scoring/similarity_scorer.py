from app.models.recommender_models import CandidateMovie
from app.models.user_profile import UserTasteProfile

class SimilarityScorer:
    def __init__(self, weights=None):
        from app.config import DEFAULT_RANKING_WEIGHTS
        self.weights = weights or DEFAULT_RANKING_WEIGHTS

    def score(self, candidate: CandidateMovie, profile: UserTasteProfile) -> float:
        score = float(candidate.base_similarity) * self.weights.similarity
        
        # Genre Match
        genre_score = 0.0
        if profile.genre_distribution and candidate.genres:
            match_val = sum([profile.genre_distribution.get(g, 0.0) for g in candidate.genres])
            genre_score = min(match_val, 1.0)
        score += genre_score * self.weights.genre_match
        
        # Cast & Crew Match
        cast_crew_score = 0.0
        match_points = 0
        if profile.favorite_directors and candidate.directors:
            if any(d in profile.favorite_directors for d in candidate.directors):
                match_points += 0.5
        if profile.favorite_actors and candidate.actors:
            actor_matches = sum([1 for a in candidate.actors if a in profile.favorite_actors])
            match_points += min(actor_matches * 0.25, 0.5)
        cast_crew_score = match_points
        score += cast_crew_score * self.weights.cast_crew_match
        
        # Normalize the similarity score portion so it returns a clean 0-1 range
        total_possible = self.weights.similarity + self.weights.genre_match + self.weights.cast_crew_match
        return score / total_possible if total_possible > 0 else score
