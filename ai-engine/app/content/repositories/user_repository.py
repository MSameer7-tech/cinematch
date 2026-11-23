import os
import uuid
from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False

class UserRepository:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY else None

    def get_user_preferences(self, user_id: str) -> dict:
        if not self.supabase or not user_id or not is_valid_uuid(user_id):
            return {}
        try:
            res = self.supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print(f"Error fetching user preferences: {e}")
        return {}

    def get_user_favorites(self, user_id: str) -> list:
        if not self.supabase or not user_id or not is_valid_uuid(user_id):
            return []
        try:
            res = self.supabase.table("favorites").select("media_id").eq("user_id", user_id).execute()
            return [item.get("media_id") or item.get("movie_id") for item in res.data if item]
        except Exception as e:
            print(f"Error fetching user favorites: {e}")
        return []

    def get_user_watchlist(self, user_id: str) -> list:
        if not self.supabase or not user_id or not is_valid_uuid(user_id):
            return []
        try:
            res = self.supabase.table("watchlists").select("media_id").eq("user_id", user_id).execute()
            return [item.get("media_id") or item.get("movie_id") for item in res.data if item]
        except Exception as e:
            print(f"Error fetching user watchlist: {e}")
        return []

    def get_user_ratings(self, user_id: str) -> list:
        if not self.supabase or not user_id or not is_valid_uuid(user_id):
            return []
        try:
            res = self.supabase.table("ratings").select("media_id,rating").eq("user_id", user_id).execute()
            return res.data or []
        except Exception as e:
            print(f"Error fetching user ratings: {e}")
        return []
