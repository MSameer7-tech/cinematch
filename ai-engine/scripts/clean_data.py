import os
import sys
import argparse
import logging
from datetime import datetime
import pandas as pd
import numpy as np

# Add parent directory to python path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(config.DATA_DIR, "cleaner.log"), mode="a", encoding="utf-8")
    ]
)
logger = logging.getLogger("movie_cleaner")

# Required columns list
REQUIRED_COLUMNS = [
    "movie_id", "title", "overview", "genre_names", "genre_ids",
    "keywords", "cast", "director", "runtime", "release_year",
    "vote_average", "vote_count", "popularity", "production_companies",
    "production_countries", "spoken_languages", "adult", "status"
]

def main():
    parser = argparse.ArgumentParser(description="Clean parsed TMDB movie CSV for ML pipelines.")
    parser.add_argument("--version", type=str, default=config.DATA_VERSION,
                        help=f"Dataset version suffix (default: {config.DATA_VERSION})")
    args = parser.parse_args()
    
    logger.info("Initializing cleaner stage...")
    
    # Paths
    parsed_filename = f"movies_parsed_{args.version}.csv"
    parsed_filepath = os.path.join(config.INTERMEDIATE_DATA_DIR, parsed_filename)
    
    if not os.path.exists(parsed_filepath):
        logger.error(f"Parsed movie CSV not found at: {parsed_filepath}. Run parser script first.")
        sys.exit(1)
        
    # Step 1: Load Parsed Dataset
    df = pd.read_csv(parsed_filepath)
    initial_rows = len(df)
    
    # Step 2: Validate Columns
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        logger.error(f"Required columns missing from input: {missing_cols}. Cleaning aborted.")
        sys.exit(1)
        
    # Step 3: Remove Duplicate Movies
    # Count duplicates before dropping
    duplicate_count = df.duplicated(subset=["movie_id"]).sum()
    df = df.drop_duplicates(subset=["movie_id"], keep="first")
    
    # Step 4: Remove Invalid Movies (Missing Title or Overview)
    # Count rows before invalid check
    rows_before_invalid = len(df)
    
    # Check missing titles or overviews
    missing_title_count = df["title"].isna().sum() + (df["title"].astype(str).str.strip() == "").sum()
    missing_overview_count = df["overview"].isna().sum() + (df["overview"].astype(str).str.strip() == "").sum()
    
    # Filter rows: must have non-empty title and overview
    df = df[df["title"].notna() & (df["title"].astype(str).str.strip() != "")]
    df = df[df["overview"].notna() & (df["overview"].astype(str).str.strip() != "")]
    
    removed_invalid_count = rows_before_invalid - len(df)
    
    # Step 5 & 8: Runtime Handling & Numeric Conversion
    df["runtime"] = pd.to_numeric(df["runtime"], errors="coerce")
    df.loc[df["runtime"] == 0, "runtime"] = np.nan
    
    # Step 6 & 8: Release Year Handling & Numeric Conversion
    df["release_year"] = pd.to_numeric(df["release_year"], errors="coerce")
    
    # Step 8: Other Numeric Conversions
    df["vote_average"] = pd.to_numeric(df["vote_average"], errors="coerce")
    df["vote_count"] = pd.to_numeric(df["vote_count"], errors="coerce")
    df["popularity"] = pd.to_numeric(df["popularity"], errors="coerce")
    
    # Count missing metrics before text normalization
    runtime_missing = df["runtime"].isna().sum()
    keywords_missing = df["keywords"].isna().sum() + (df["keywords"].astype(str).str.strip() == "").sum() + (df["keywords"] == "nan").sum()
    director_missing = df["director"].isna().sum() + (df["director"].astype(str).str.strip() == "").sum() + (df["director"] == "nan").sum()
    cast_missing = df["cast"].isna().sum() + (df["cast"].astype(str).str.strip() == "").sum() + (df["cast"] == "nan").sum()
    
    # Step 7: Normalize Text (Replace NaN with empty string for vectorizer safety)
    text_cols = [
        "genre_names", "keywords", "cast", "director",
        "production_companies", "production_countries", "spoken_languages"
    ]
    for col in text_cols:
        df[col] = df[col].fillna("").astype(str).str.strip()
        # Clean up any literal "nan" strings that pandas might have parsed from CSV na
        df.loc[df[col].str.lower() == "nan", col] = ""
        
    # Step 9: Range Validation (Invalid values outside ranges become NaN)
    # Runtime > 0 (handled above by converting 0/negative to NaN)
    df.loc[df["runtime"] <= 0, "runtime"] = np.nan
    
    # Vote Average 0-10
    df.loc[(df["vote_average"] < 0) | (df["vote_average"] > 10), "vote_average"] = np.nan
    
    # Popularity >= 0
    df.loc[df["popularity"] < 0, "popularity"] = np.nan
    
    # Vote Count >= 0
    df.loc[df["vote_count"] < 0, "vote_count"] = np.nan
    
    # Release Year (1888 to Current Year + 2)
    max_valid_year = datetime.now().year + 2
    df.loc[(df["release_year"] < 1888) | (df["release_year"] > max_valid_year), "release_year"] = np.nan
    
    # Step 10: Quality Metrics Report
    summary_report = f"""
========== Data Quality Report ==========
Rows Loaded: {initial_rows}
Duplicate Movies Removed: {duplicate_count}
Rows Removed (Missing Title): {missing_title_count}
Rows Removed (Missing Overview): {missing_overview_count}
Runtime Missing: {runtime_missing}
Keywords Missing: {keywords_missing}
Director Missing: {director_missing}
Cast Missing: {cast_missing}
=========================================
"""
    print(summary_report)
    
    # Write quality report to log folder too
    report_path = os.path.join(config.DATA_DIR, f"quality_report_{args.version}.txt")
    with open(report_path, "w", encoding="utf-8") as rf:
        rf.write(summary_report)
        
    # Step 11: Save clean CSV
    output_filename = f"movies_clean_{args.version}.csv"
    output_filepath = os.path.join(config.INTERMEDIATE_DATA_DIR, output_filename)
    
    # Save clean dataset
    df.to_csv(output_filepath, index=False, encoding="utf-8")
    
    logger.info("Cleaning workflow complete.")
    logger.info(f"Cleaned dataset saved to: {output_filepath}")

if __name__ == "__main__":
    main()
