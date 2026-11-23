from app.models.recommender_models import CandidateMovie

class FreshnessScorer:
    def score(self, candidate: CandidateMovie) -> float:
        # Age-based freshness score
        current_year = 2026
        if not candidate.release_year:
            return 0.0
            
        age = current_year - int(candidate.release_year)
        if age <= 2:
            return 1.0
        elif age <= 5:
            return 0.8
        elif age <= 10:
            return 0.5
        elif age <= 20:
            return 0.2
        return 0.0
