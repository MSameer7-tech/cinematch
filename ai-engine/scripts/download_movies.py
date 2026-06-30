import os
import sys
import time
import argparse
import logging
import json
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from tqdm import tqdm

# Add parent directory to python path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(config.DATA_DIR, "downloader.log"), mode="a", encoding="utf-8")
    ]
)
logger = logging.getLogger("movie_downloader")

# Configure a global requests Session with retries and browser-like user agent
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
})

# Configure Retry adapter
retries = Retry(
    total=5, 
    backoff_factor=1, 
    status_forcelist=[429, 500, 502, 503, 504],
    raise_on_status=False
)
session.mount("https://", HTTPAdapter(max_retries=retries))

def fetch_popular_movie_ids(pages_to_scan):
    """
    Query the TMDB discover API to fetch list of popular movie IDs.
    """
    logger.info(f"Starting retrieval of candidate movie IDs across {pages_to_scan} pages...")
    movie_ids = []
    
    for page in range(1, pages_to_scan + 1):
        url = "https://api.themoviedb.org/3/discover/movie"
        params = {
            "api_key": config.TMDB_API_KEY,
            "sort_by": "popularity.desc",
            "page": page
        }
        
        try:
            response = session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            for movie in results:
                if "id" in movie:
                    movie_ids.append(movie["id"])
        except Exception as e:
            logger.error(f"Failed to fetch page {page} of popular movies. Error: {e}")
            
        time.sleep(config.RATE_LIMIT_DELAY)
        
    logger.info(f"Found {len(movie_ids)} candidate movie IDs.")
    # Deduplicate candidate IDs
    return list(set(movie_ids))

def download_movie_details(movie_id):
    """
    Fetch full details for a single movie (including credits and keywords) and save to raw folder.
    """
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {
        "api_key": config.TMDB_API_KEY,
        "append_to_response": "credits,keywords"
    }
    
    try:
        response = session.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to download movie ID {movie_id} details: {e}")
        raise e

def main():
    parser = argparse.ArgumentParser(description="Download popular movies from TMDB.")
    parser.add_argument("--pages", type=int, default=config.TMDB_PAGES, 
                        help=f"Number of TMDB discover pages to scan (default: {config.TMDB_PAGES})")
    args = parser.parse_args()
    
    if not config.TMDB_API_KEY:
        logger.error("TMDB_API_KEY is not configured in config.py or environment variables. Exiting.")
        sys.exit(1)
        
    os.makedirs(config.RAW_DATA_DIR, exist_ok=True)
    
    start_time = time.time()
    
    # Retrieve movie IDs
    movie_ids = fetch_popular_movie_ids(args.pages)
    
    downloaded = 0
    skipped = 0
    failed = 0
    
    logger.info("Starting processing of individual movie metadata...")
    for movie_id in tqdm(movie_ids, desc="Downloading movies"):
        filepath = os.path.join(config.RAW_DATA_DIR, f"movie_{movie_id}.json")
        
        # Check if already downloaded
        if os.path.exists(filepath):
            skipped += 1
            continue
            
        try:
            details = download_movie_details(movie_id)
            if details:
                # Write raw JSON to file
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(details, f, indent=2, ensure_ascii=False)
                downloaded += 1
            else:
                failed += 1
        except Exception:
            failed += 1
            
        time.sleep(config.RATE_LIMIT_DELAY)
        
    elapsed_time = time.time() - start_time
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)
    
    # Print execution summary
    summary = f"""
----------------------------------------
Download Summary:
----------------------------------------
Pages Scanned: {args.pages}
Candidates Found: {len(movie_ids)}
Downloaded: {downloaded}
Skipped: {skipped}
Failed: {failed}
Elapsed Time: {minutes}m {seconds}s
----------------------------------------
"""
    logger.info("Downloading workflow complete.")
    print(summary)

if __name__ == "__main__":
    main()
