from app.models.recommender_models import CandidateMovie

class PopularityScorer:
    def score(self, candidate: CandidateMovie, max_popularity: float = 1.0) -> float:
        # Standardized popularity score
        pop = float(candidate.popularity)
        return pop / max_popularity if max_popularity > 0 else 0.0
