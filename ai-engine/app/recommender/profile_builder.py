import os
import requests
import pandas as pd
from collections import Counter
import sys

# Ensure ai-engine is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user_profile import UserTasteProfile
from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PROCESSED_DATA_DIR, DATA_VERSION

class ProfileBuilder:
    def __init__(self):
        self.headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.base_url = SUPABASE_URL
        
        # Load movie features to resolve genres/directors/cast
        data_path = os.path.join(PROCESSED_DATA_DIR, f"movie_features_{DATA_VERSION}.parquet")
        self.movies_df = pd.read_parquet(data_path)
        self.movies_df.set_index('movie_id', inplace=True)
        
    def _fetch_table(self, table_name: str, select="*", user_id: str = None):
        try:
            url = f"{self.base_url}/rest/v1/{table_name}?select={select}"
            if user_id:
                url += f"&user_id=eq.{user_id}"
            response = requests.get(url, headers=self.headers, timeout=4)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            # Silently degrade on network/DB failure
            return []

    def build_profile(self, user_id: str = None) -> UserTasteProfile:
        profile = UserTasteProfile()
        if not user_id or user_id == "guest":
            return profile

        try:
            import uuid
            uuid.UUID(str(user_id))
        except (ValueError, TypeError):
            return profile
                
        # 1. Fetch Ratings
        ratings = self._fetch_table("ratings", "media_id,rating,user_id", user_id=user_id)
        user_ratings = [r for r in ratings if r.get("user_id") == user_id]
        
        for r in user_ratings:
            if "media_id" in r:
                profile.rated_movie_ids.append(r["media_id"])
                if r.get("rating", 0) >= 8:
                    profile.highly_rated_movie_ids.append(r["media_id"])
                
        # 2. Fetch Favorites
        favorites = self._fetch_table("favorites", "media_id,user_id", user_id=user_id)
        profile.favorite_movie_ids = [f["media_id"] for f in favorites if f.get("user_id") == user_id and "media_id" in f]
        
        # 3. Fetch Watchlist
        watchlists = self._fetch_table("watchlists", "media_id,user_id", user_id=user_id)
        profile.watchlist_movie_ids = [w["media_id"] for w in watchlists if w.get("user_id") == user_id and "media_id" in w]
        
        # 4. Fetch Recently Viewed
        recent = self._fetch_table("recently_viewed", "media_id,user_id,viewed_at", user_id=user_id)
        user_recent = [r for r in recent if r.get("user_id") == user_id and "media_id" in r]
        user_recent.sort(key=lambda x: x.get("viewed_at", ""), reverse=True)
        profile.recent_movie_ids = [r["media_id"] for r in user_recent]
        
        # 5. Fetch User Preferences
        prefs = self._fetch_table("user_preferences", "*", user_id=user_id)
        user_prefs = next((p for p in prefs if p.get("user_id") == user_id), None)
        if user_prefs:
            profile.preferred_languages = user_prefs.get("favorite_languages", [])
            profile.countries = user_prefs.get("favorite_countries", [])
            profile.include_adult = user_prefs.get("include_adult", False)
            
        # 6. Learn Taste from Liked Movies
        # We consider a movie "liked" if it's in favorites or highly rated
        liked_movie_ids = set(profile.favorite_movie_ids + profile.highly_rated_movie_ids)
        
        genre_counter = Counter()
        director_counter = Counter()
        actor_counter = Counter()
        
        for mid in liked_movie_ids:
            if mid in self.movies_df.index:
                row = self.movies_df.loc[mid]
                
                # Genres (assuming genre_names is a comma-separated string)
                if pd.notna(row.get('genre_names')) and row['genre_names']:
                    genres = [g.strip() for g in row['genre_names'].split(',')]
                    genre_counter.update(genres)
                    
                # Director
                if pd.notna(row.get('director')) and row['director']:
                    director_counter.update([row['director'].strip()])
                    
                # Cast (assuming cast is a comma-separated string)
                if pd.notna(row.get('cast')) and row['cast']:
                    actors = [a.strip() for a in row['cast'].split(',')]
                    actor_counter.update(actors)
                    
        # Extract top elements for the profile
        profile.favorite_genres = [item[0] for item in genre_counter.most_common(10)]
        profile.favorite_directors = [item[0] for item in director_counter.most_common(5)]
        profile.favorite_actors = [item[0] for item in actor_counter.most_common(10)]
        
        # Calculate genre distribution for Diversity Engine
        total_genres = sum(genre_counter.values())
        if total_genres > 0:
            profile.genre_distribution = {g: count/total_genres for g, count in genre_counter.items()}
            
        # Enforce Recommendation Cooldown (Phase 4)
        try:
            from app.content.config import COOLDOWN_DAYS, MAX_REPEAT_PER_MONTH
            from app.content.repositories.history_repository import HistoryRepository
            
            hist_repo = HistoryRepository()
            history = hist_repo.get_recommendation_history(user_id, days_limit=COOLDOWN_DAYS)
            
            shown_counter = Counter([h["media_id"] for h in history])
            cooldown_ids = []
            
            for mid, count in shown_counter.items():
                # Cooldown logic: shown in last 30 days OR shown more than max limit times
                if count >= MAX_REPEAT_PER_MONTH or mid in [h["media_id"] for h in history]:
                    cooldown_ids.append(mid)
                    
            profile.cooldown_movie_ids = cooldown_ids
        except Exception as e:
            print(f"Error building cooldown profile: {e}")

        return profile
