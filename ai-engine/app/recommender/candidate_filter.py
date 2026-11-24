from app.models.recommendation_context import RecommendationContext

class CandidateFilter:
    def filter_candidates(self, context: RecommendationContext) -> None:
        """
        Modifies context.candidates in-place, removing invalid/watched movies.
        """
        profile = context.profile
        
        # 1. Watched Movies (from rated, watchlist, favorites, recent)
        watched_ids = set()
        watched_ids.update(profile.rated_movie_ids)
        watched_ids.update(profile.favorite_movie_ids)
        watched_ids.update(profile.watchlist_movie_ids)
        watched_ids.update(profile.recent_movie_ids)
        if hasattr(profile, "cooldown_movie_ids") and profile.cooldown_movie_ids:
            watched_ids.update(profile.cooldown_movie_ids)
        
        filtered_candidates = []
        for candidate in context.candidates:
            # Filter 1: Already watched
            if candidate.movie_id in watched_ids:
                continue
                
            # Filter 2: Adult movies
            if candidate.adult and not profile.include_adult:
                continue
                
            # Filter 3: Preferred Languages
            # If the user has strict language preferences, remove movies that don't match.
            # Note: TMDB spoken languages are English, Japanese, French, etc.
            if profile.preferred_languages:
                # Assuming candidate.spoken_languages holds names like "English"
                if not set(candidate.spoken_languages).intersection(set(profile.preferred_languages)):
                    continue
                    
            # Filter 4: Low metadata score
            # Drop movies with a metadata score < 2 (they lack basic information like genres/overview)
            if candidate.metadata_score < 2:
                continue
                
            # Filter 5: Exclude unreleased movies (status not "Released" or release_year > current_year)
            import datetime
            current_year = datetime.datetime.now().year
            if candidate.status and candidate.status.lower() != "released":
                continue
            if candidate.release_year and candidate.release_year > current_year:
                continue

            # Filter 6: Quality threshold to prevent low-budget, obscure movies from dominating
            min_votes = 40 if candidate.release_year and candidate.release_year >= current_year - 2 else 100
            if candidate.vote_count < min_votes:
                continue
                
            # Filter 7: Minimum rating threshold
            if candidate.vote_average > 0 and candidate.vote_average < 5.5:
                continue
                
            filtered_candidates.append(candidate)
            
        context.candidates = filtered_candidates
