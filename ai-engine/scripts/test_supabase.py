import os
import requests
from dotenv import load_dotenv

# Load env variables
load_dotenv()

def test_supabase():
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment.")
        return

    # PostgREST URL for watchlists
    url = f"{supabase_url}/rest/v1/watchlists"
    
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        watchlist_items = response.json()
        
        # Extract and print movie IDs
        movie_ids = [item.get("movie_id") for item in watchlist_items if "movie_id" in item]
        print(movie_ids)
    except Exception as e:
        print(f"Error querying Supabase: {e}")

if __name__ == "__main__":
    test_supabase()
