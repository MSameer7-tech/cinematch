import os
import requests
from dotenv import load_dotenv

# Load env variables from the parent or current folder .env
load_dotenv()

def test_tmdb():
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        print("Error: TMDB_API_KEY not found in environment variables.")
        return

    # Movie ID for Interstellar is 157336
    movie_id = 157336
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {"api_key": api_key}

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        title = data.get("title")
        print(title)
    except Exception as e:
        print(f"Error querying TMDB API: {e}")

if __name__ == "__main__":
    test_tmdb()
