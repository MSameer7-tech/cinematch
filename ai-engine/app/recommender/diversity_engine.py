from app.models.recommendation_context import RecommendationContext

class DiversityEngine:
    def enforce_diversity(self, context: RecommendationContext, limit: int = 20) -> None:
        """
        Takes the ranked candidates and ensures the final list reflects the user's genre distribution.
        """
        if not context.candidates:
            return
            
        profile = context.profile
        
        if not profile.genre_distribution:
            context.candidates = context.candidates[:limit]
            return
            
        # Wildcard bucket size (15%)
        wildcard_limit = max(1, int(limit * 0.15))
        targeted_limit = limit - wildcard_limit
        
        # Calculate target slots per genre
        genre_slots = {}
        for genre, pct in profile.genre_distribution.items():
            slots = round(targeted_limit * pct)
            if slots > 0:
                genre_slots[genre] = slots
                
        final_list = []
        used_movie_ids = set()
        
        # Group candidates by primary genre
        for target_genre, slots in genre_slots.items():
            filled = 0
            for candidate in context.candidates:
                if filled >= slots:
                    break
                if candidate.movie_id in used_movie_ids:
                    continue
                    
                if candidate.genres and candidate.genres[0] == target_genre:
                    final_list.append(candidate)
                    used_movie_ids.add(candidate.movie_id)
                    filled += 1
                    
        # Fill remaining slots (wildcards + any unfulfilled genre slots)
        remaining_slots = limit - len(final_list)
        if remaining_slots > 0:
            for candidate in context.candidates:
                if len(final_list) >= limit:
                    break
                if candidate.movie_id not in used_movie_ids:
                    final_list.append(candidate)
                    used_movie_ids.add(candidate.movie_id)
                    
        # Re-sort final list by rank score so best movies are at the top
        final_list.sort(key=lambda x: x.rank_score, reverse=True)
        context.candidates = final_list
