from app.models.recommender_models import CandidateMovie

class NoveltyScorer:
    def score(self, candidate: CandidateMovie, max_popularity: float = 1.0) -> float:
        # Novelty: inverse of normalized popularity
        pop = float(candidate.popularity)
        norm_pop = pop / max_popularity if max_popularity > 0 else 0.0
        return 1.0 - norm_pop
