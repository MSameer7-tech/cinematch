import time
from typing import Dict, Any, List

class RecommendationCache:
    """
    A custom, dictionary-based TTL cache for user recommendations.
    Provides fast, in-memory caching with zero external dependencies.
    """
    def __init__(self, ttl_seconds: int = 900): # 15 minutes by default
        self.ttl_seconds = ttl_seconds
        # Structure: { user_id: {"data": [...], "expires_at": float} }
        self.store: Dict[str, Dict[str, Any]] = {}
        
        # Statistics
        self.hits = 0
        self.misses = 0

    def get(self, user_id: str) -> List[dict] | None:
        """Retrieves cached recommendations for a user if they exist and are fresh."""
        self.cleanup_expired()
        
        if user_id in self.store:
            self.hits += 1
            return self.store[user_id]["data"]
            
        self.misses += 1
        return None

    def set(self, user_id: str, recommendations: List[dict]) -> None:
        """Caches recommendations for a user."""
        self.cleanup_expired()
        self.store[user_id] = {
            "data": recommendations,
            "expires_at": time.time() + self.ttl_seconds
        }

    def invalidate(self, user_id: str) -> None:
        """Removes a specific user's cached recommendations (e.g. when their preferences change)."""
        if user_id in self.store:
            del self.store[user_id]

    def invalidate_all(self) -> None:
        """Clears the entire cache."""
        self.store.clear()
        
    def warm(self, user_id: str, recommendations: List[dict]) -> None:
        """
        Pre-computes and stores recommendations for a user.
        Currently behaves identical to set(), but designed for async cron jobs.
        """
        self.set(user_id, recommendations)

    def cleanup_expired(self) -> int:
        """Removes expired entries and returns the number of cleaned entries."""
        now = time.time()
        expired_keys = [
            user_id for user_id, entry in self.store.items() 
            if entry["expires_at"] < now
        ]
        for key in expired_keys:
            del self.store[key]
            
        return len(expired_keys)

    def stats(self) -> Dict[str, Any]:
        """Returns cache operational statistics."""
        current_entries = len(self.store)
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0.0
        
        # We call cleanup_expired to calculate exactly how many were just expired
        # (Though they are removed, we can just return the count of what was cleaned)
        expired_count = self.cleanup_expired()
        
        return {
            "cache_hits": self.hits,
            "cache_misses": self.misses,
            "hit_rate_percent": round(hit_rate, 2),
            "current_entries": current_entries - expired_count,
            "expired_entries_cleaned": expired_count
        }

# Global singleton instance for the FastAPI app
recommendation_cache = RecommendationCache()
