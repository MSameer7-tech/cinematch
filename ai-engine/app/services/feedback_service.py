import os
from supabase import create_client, Client
from typing import Optional, List, Dict

class FeedbackService:
    def __init__(self):
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Feedback Service may fail.")
        
        # Using Service Role Key allows the backend to insert safely for users if needed, 
        # or we could pass the user's JWT, but for internal microservice service_role is easier.
        self.supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

    def submit_feedback(self, user_id: str, movie_id: int, feedback_type: str) -> None:
        """Upserts a user's feedback ('LIKE' or 'DISLIKE') for a specific movie."""
        if not self.supabase:
            return
            
        data = {
            "user_id": user_id,
            "movie_id": movie_id,
            "feedback_type": feedback_type
        }
        # Upsert: If user_id + movie_id exists (due to UNIQUE constraint), update it
        self.supabase.table("recommendation_feedback").upsert(data, on_conflict="user_id,movie_id").execute()

    def get_feedback(self, user_id: str) -> List[Dict]:
        """Gets all feedback for a user."""
        if not self.supabase:
            return []
            
        result = self.supabase.table("recommendation_feedback").select("*").eq("user_id", user_id).execute()
        return result.data

    def delete_feedback(self, user_id: str, movie_id: int) -> None:
        """Deletes feedback for a specific movie."""
        if not self.supabase:
            return
            
        self.supabase.table("recommendation_feedback").delete().match({"user_id": user_id, "movie_id": movie_id}).execute()

feedback_service = FeedbackService()
