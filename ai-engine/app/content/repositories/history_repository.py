import os
import uuid
from datetime import datetime, timedelta
from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False

class HistoryRepository:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY else None

    def get_recently_viewed(self, user_id: str, limit: int = 10) -> list:
        if not self.supabase or not user_id or not is_valid_uuid(user_id):
            return []
        try:
            res = self.supabase.table("recently_viewed")\
                .select("media_id,viewed_at")\
                .eq("user_id", user_id)\
                .order("viewed_at", desc=True)\
                .limit(limit)\
                .execute()
            return [item["media_id"] for item in res.data]
        except Exception as e:
            print(f"Error fetching recently viewed: {e}")
        return []

    def get_recommendation_history(self, user_id: str, days_limit: int = 30) -> list:
        if not self.supabase or not user_id or not is_valid_uuid(user_id):
            return []
        try:
            cutoff = (datetime.utcnow() - timedelta(days=days_limit)).isoformat()
            res = self.supabase.table("recommendation_history")\
                .select("media_id,section_type,shown_at")\
                .eq("user_id", user_id)\
                .gte("shown_at", cutoff)\
                .execute()
            return res.data
        except Exception as e:
            print(f"Error fetching recommendation history: {e}")
        return []

    def record_shown_recommendations(self, user_id: str, movie_ids: list, section_type: str) -> None:
        if not self.supabase or not movie_ids or not user_id or not is_valid_uuid(user_id):
            return
        try:
            records = [
                {
                    "user_id": user_id,
                    "media_id": mid,
                    "media_type": "movie",
                    "section_type": section_type,
                    "shown_at": datetime.utcnow().isoformat()
                }
                for mid in movie_ids
            ]
            self.supabase.table("recommendation_history").insert(records).execute()
        except Exception as e:
            print(f"Error recording shown recommendations: {e}")
