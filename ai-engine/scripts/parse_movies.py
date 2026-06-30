import os
import sys
import glob
import json
import argparse
import logging
import pandas as pd

# Add parent directory to python path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(config.DATA_DIR, "parser.log"), mode="a", encoding="utf-8")
    ]
)
logger = logging.getLogger("movie_parser")

def extract_release_year(release_date_str):
    """
    Extract first 4 characters as release year if format is YYYY-MM-DD.
    """
    if release_date_str and len(release_date_str) >= 4:
        return release_date_str[:4]
    return ""

def parse_single_movie(filepath):
    """
    Load a raw TMDB movie JSON and parse key fields.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Extract genres
    genres = data.get("genres", [])
    genre_names = ",".join([g.get("name", "") for g in genres if g.get("name")])
    genre_ids = ",".join([str(g.get("id", "")) for g in genres if g.get("id") is not None])
    
    # Extract keywords (under keywords.keywords)
    keywords_data = data.get("keywords", {}).get("keywords", [])
    keywords = ",".join([k.get("name", "") for k in keywords_data if k.get("name")])
    
    # Extract cast (top TOP_CAST_LIMIT actors from credits.cast)
    credits = data.get("credits", {})
    cast_data = credits.get("cast", [])
    top_cast = cast_data[:config.TOP_CAST_LIMIT]
    cast = ",".join([c.get("name", "") for c in top_cast if c.get("name")])
    
    # Extract director (first member in credits.crew with job == 'Director')
    crew_data = credits.get("crew", [])
    directors = [c.get("name", "") for c in crew_data if c.get("job") == "Director"]
    director = directors[0] if directors else ""
    
    # Extract production companies, countries, spoken languages
    prod_companies = ",".join([c.get("name", "") for c in data.get("production_companies", []) if c.get("name")])
    prod_countries = ",".join([c.get("name", "") for c in data.get("production_countries", []) if c.get("name")])
    spoken_langs = ",".join([l.get("name", "") for l in data.get("spoken_languages", []) if l.get("name")])
    
    movie_record = {
        "movie_id": data.get("id"),
        "title": data.get("title", ""),
        "overview": data.get("overview", ""),
        "genre_names": genre_names,
        "genre_ids": genre_ids,
        "keywords": keywords,
        "cast": cast,
        "director": director,
        "runtime": data.get("runtime"),
        "release_year": extract_release_year(data.get("release_date")),
        "vote_average": data.get("vote_average"),
        "vote_count": data.get("vote_count"),
        "popularity": data.get("popularity"),
        "production_companies": prod_companies,
        "production_countries": prod_countries,
        "spoken_languages": spoken_langs,
        "adult": data.get("adult", False),
        "status": data.get("status", "")
    }
    
    return movie_record

def main():
    parser = argparse.ArgumentParser(description="Parse raw TMDB movie JSON files into a structured CSV.")
    parser.add_argument("--version", type=str, default=config.DATA_VERSION,
                        help=f"Dataset version suffix (default: {config.DATA_VERSION})")
    args = parser.parse_args()
    
    logger.info("Initializing parser stage...")
    
    # Find all json files in raw directory
    search_path = os.path.join(config.RAW_DATA_DIR, "movie_*.json")
    json_files = glob.glob(search_path)
    
    if not json_files:
        logger.error(f"No movie JSON files found in {config.RAW_DATA_DIR}. Make sure downloader has run.")
        sys.exit(1)
        
    logger.info(f"Found {len(json_files)} raw JSON files to parse.")
    
    parsed_records = []
    errors = 0
    
    for filepath in json_files:
        try:
            record = parse_single_movie(filepath)
            parsed_records.append(record)
        except Exception as e:
            errors += 1
            logger.error(f"Failed to parse {os.path.basename(filepath)}. Error: {e}")
            
    # Create DataFrame
    df = pd.DataFrame(parsed_records)
    
    # Ensure intermediate directory exists
    os.makedirs(config.INTERMEDIATE_DATA_DIR, exist_ok=True)
    
    output_filename = f"movies_parsed_{args.version}.csv"
    output_filepath = os.path.join(config.INTERMEDIATE_DATA_DIR, output_filename)
    
    # Save as CSV
    df.to_csv(output_filepath, index=False, encoding="utf-8")
    
    logger.info("Parsing workflow complete.")
    logger.info(f"Summary -> Total files scanned: {len(json_files)} | Parsed successfully: {len(parsed_records)} | Errors: {errors}")
    logger.info(f"Output saved to: {output_filepath}")

if __name__ == "__main__":
    main()
