from app.models.recommendation_context import RecommendationContext

def matches_candidate_language(candidate, language_str: str) -> bool:
    if not language_str:
        return True
    lang_lower = language_str.strip().lower()
    spoken = [s.lower() for s in candidate.spoken_languages]
    countries = [c.lower() for c in candidate.production_countries]
    
    if "hindi" in lang_lower or "indian" in lang_lower:
        return (any("हिन्दी" in s or "hindi" in s for s in spoken) and any("india" in c for c in countries)) or any("india" in c for c in countries) or any("हिन्दी" in s for s in spoken)
    elif "korean" in lang_lower:
        return any("한국어" in s or "korean" in s for s in spoken) or any("korea" in c for c in countries)
    elif "japanese" in lang_lower:
        return any("日本語" in s or "japanese" in s for s in spoken) or any("japan" in c for c in countries)
    elif "french" in lang_lower:
        return any("français" in s or "french" in s for s in spoken) or any("france" in c for c in countries)
    elif "spanish" in lang_lower:
        return any("español" in s or "spanish" in s for s in spoken) or any(c in ["spain", "mexico", "argentina", "colombia"] for c in countries)
    elif "german" in lang_lower:
        return any("deutsch" in s or "german" in s for s in spoken) or any("germany" in c for c in countries)
    elif "italian" in lang_lower:
        return any("italiano" in s or "italian" in s for s in spoken) or any("italy" in c for c in countries)
    elif "chinese" in lang_lower or "mandarin" in lang_lower or "cantonese" in lang_lower:
        return any("普通话" in s or "广州话" in s or "chinese" in s or "mandarin" in s or "cantonese" in s for s in spoken) or any(c in ["china", "hong kong", "taiwan"] for c in countries)
    elif "russian" in lang_lower:
        return any("pусский" in s or "russian" in s for s in spoken) or any("russia" in c for c in countries)
    elif "tamil" in lang_lower:
        return any("தமிழ்" in s or "tamil" in s for s in spoken)
    elif "telugu" in lang_lower:
        return any("తెలుగు" in s or "telugu" in s for s in spoken)
    elif "english" in lang_lower:
        return any("english" in s for s in spoken)
    else:
        return any(lang_lower in s for s in spoken)

class CandidateFilter:
    def filter_candidates(self, context: RecommendationContext) -> None:
        """
        Modifies context.candidates in-place, removing invalid/watched movies.
        """
        profile = context.profile
        req = context.request
        req_lang = getattr(req, 'language', None) if req else None
        
        # 1. Watched Movies (from rated, watchlist, favorites, recent, and session exclusions)
        watched_ids = set()
        watched_ids.update(profile.rated_movie_ids)
        watched_ids.update(profile.favorite_movie_ids)
        watched_ids.update(profile.watchlist_movie_ids)
        watched_ids.update(profile.recent_movie_ids)
        if hasattr(profile, "cooldown_movie_ids") and profile.cooldown_movie_ids:
            watched_ids.update(profile.cooldown_movie_ids)
        if req and getattr(req, 'exclude_movie_ids', None):
            watched_ids.update(req.exclude_movie_ids)
        
        filtered_candidates = []
        for candidate in context.candidates:
            # Filter 1: Already watched
            if candidate.movie_id in watched_ids:
                continue
                
            # Filter 2: Adult movies
            if candidate.adult and not profile.include_adult:
                continue
                
            # Filter 3: Preferred / Requested Languages
            if req_lang:
                if not matches_candidate_language(candidate, req_lang):
                    continue
            elif profile.preferred_languages:
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
            min_votes = 10 if req_lang else (40 if candidate.release_year and candidate.release_year >= current_year - 2 else 100)
            if candidate.vote_count < min_votes:
                continue
                
            # Filter 7: Minimum rating threshold
            if candidate.vote_average > 0 and candidate.vote_average < 5.5:
                continue
                
            filtered_candidates.append(candidate)
            
        context.candidates = filtered_candidates
