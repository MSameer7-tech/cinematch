import os
import sys

# Ensure ai-engine is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender.profile_builder import ProfileBuilder

def test():
    print("Initializing ProfileBuilder...")
    builder = ProfileBuilder()
    
    print("Building Taste Profile...")
    profile = builder.build_profile()
    
    print("\n--- Taste Profile ---")
    print(f"Favorite Movies: {len(profile.favorite_movie_ids)}")
    print(f"Highly Rated: {len(profile.highly_rated_movie_ids)}")
    print(f"Watchlist: {len(profile.watchlist_movie_ids)}")
    print(f"Recently Viewed: {len(profile.recent_movie_ids)}")
    print(f"\nFavorite Genres: {', '.join(profile.favorite_genres)}")
    print(f"Favorite Directors: {', '.join(profile.favorite_directors)}")
    print(f"Favorite Actors: {', '.join(profile.favorite_actors)}")

if __name__ == "__main__":
    test()
