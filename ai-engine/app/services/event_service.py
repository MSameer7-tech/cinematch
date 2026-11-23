import os
from supabase import create_client, Client
from typing import Optional

class EventService:
    def __init__(self):
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Event Service may fail.")
            
        self.supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

    def _track_event(self, user_id: str, event_type: str, movie_id: Optional[int] = None, score: Optional[float] = None) -> None:
        if not self.supabase:
            return
            
        data = {
            "user_id": user_id,
            "event_type": event_type
        }
        if movie_id is not None:
            data["movie_id"] = movie_id
        if score is not None:
            data["recommendation_score"] = score
            
        self.supabase.table("recommendation_events").insert(data).execute()

    def track_generated(self, user_id: str) -> None:
        self._track_event(user_id, "generated")

    def track_shown(self, user_id: str, movie_id: int, score: float) -> None:
        self._track_event(user_id, "shown", movie_id, score)

    def track_clicked(self, user_id: str, movie_id: int, score: float) -> None:
        self._track_event(user_id, "clicked", movie_id, score)
        
    def track_watchlisted(self, user_id: str, movie_id: int, score: float) -> None:
        self._track_event(user_id, "watchlisted", movie_id, score)
        
    def track_favorited(self, user_id: str, movie_id: int, score: float) -> None:
        self._track_event(user_id, "favorited", movie_id, score)
        
    def track_rated(self, user_id: str, movie_id: int, score: float) -> None:
        self._track_event(user_id, "rated", movie_id, score)

event_service = EventService()
