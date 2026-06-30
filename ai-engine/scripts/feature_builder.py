import os
import sys
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
        logging.FileHandler(os.path.join(config.DATA_DIR, "feature_builder.log"), mode="a", encoding="utf-8")
    ]
)
logger = logging.getLogger("feature_builder")

def clean_tag_list(tag_str):
    """
    Cleans a comma-separated list of tags (e.g. genres, keywords, cast)
    by lowercasing and removing spaces within each tag so they are single tokens.
    Example: "Science Fiction, Adventure" -> "sciencefiction adventure"
    """
    if not tag_str or pd.isna(tag_str) or tag_str.strip() == "":
        return ""
    
    tags = tag_str.split(",")
    cleaned_tags = []
    for tag in tags:
        cleaned = tag.strip().replace(" ", "").lower()
        if cleaned:
            cleaned_tags.append(cleaned)
            
    return " ".join(cleaned_tags)

def clean_single_tag(tag_str):
    """
    Cleans a single tag (e.g. director) by lowercasing and removing spaces.
    Example: "Christopher Nolan" -> "christophernolan"
    """
    if not tag_str or pd.isna(tag_str) or tag_str.strip() == "":
        return ""
    return tag_str.strip().replace(" ", "").lower()

def clean_overview(overview_str):
    """
    Normalizes overview by converting to lowercase and stripping extra spacing.
    """
    if not overview_str or pd.isna(overview_str) or overview_str.strip() == "":
        return ""
    return " ".join(overview_str.strip().lower().split())

def main():
    parser = argparse.ArgumentParser(description="Build feature vectors for movie content recommendations.")
    parser.add_argument("--version", type=str, default=config.DATA_VERSION,
                        help=f"Dataset version suffix (default: {config.DATA_VERSION})")
    args = parser.parse_args()
    
    logger.info("Initializing feature builder stage...")
    
    # Paths
    clean_filename = f"movies_clean_{args.version}.csv"
    clean_filepath = os.path.join(config.INTERMEDIATE_DATA_DIR, clean_filename)
    
    if not os.path.exists(clean_filepath):
        logger.error(f"Cleaned movie CSV not found at: {clean_filepath}. Run cleaner script first.")
        sys.exit(1)
        
    df = pd.read_csv(clean_filepath)
    
    logger.info(f"Loaded {len(df)} cleaned movie records.")
    
    # Step 1: Preprocess individual fields
    logger.info("Engineering feature columns...")
    df["genre_features"] = df["genre_names"].apply(clean_tag_list)
    df["keyword_features"] = df["keywords"].apply(clean_tag_list)
    df["cast_features"] = df["cast"].apply(clean_tag_list)
    df["director_features"] = df["director"].apply(clean_single_tag)
    df["overview_features"] = df["overview"].apply(clean_overview)
    
    # Step 2: Combine columns into content_features
    logger.info("Compiling combined content_features column...")
    feature_columns = [
        df["genre_features"],
        df["keyword_features"],
        df["cast_features"],
        df["director_features"],
        df["overview_features"]
    ]
    
    # Concatenate features with single space, filtering out empty strings
    df["content_features"] = df.apply(
        lambda row: " ".join([
            str(row[col]) for col in [
                "genre_features", "keyword_features", 
                "cast_features", "director_features", "overview_features"
            ] if str(row[col]).strip() != ""
        ]),
        axis=1
    )
    
    # Ensure processed folder exists
    os.makedirs(config.PROCESSED_DATA_DIR, exist_ok=True)
    
    # Define outputs
    pkl_filename = f"movie_features_{args.version}.pkl"
    parquet_filename = f"movie_features_{args.version}.parquet"
    
    pkl_filepath = os.path.join(config.PROCESSED_DATA_DIR, pkl_filename)
    parquet_filepath = os.path.join(config.PROCESSED_DATA_DIR, parquet_filename)
    
    # Step 3: Save results in Pickle and Parquet formats
    logger.info("Serializing processed features...")
    df.to_pickle(pkl_filepath)
    df.to_parquet(parquet_filepath, index=False)
    
    logger.info("Feature engineering workflow complete.")
    logger.info(f"Pickle saved to: {pkl_filepath}")
    logger.info(f"Parquet saved to: {parquet_filepath}")
    
    # Spot check one row to verify
    if len(df) > 0:
        sample_row = df.iloc[0]
        print("\n========== Feature Verification Sample ==========")
        print(f"Title: {sample_row['title']}")
        print(f"Genre Features: '{sample_row['genre_features']}'")
        print(f"Keyword Features: '{sample_row['keyword_features']}'")
        print(f"Director Features: '{sample_row['director_features']}'")
        print(f"Cast Features: '{sample_row['cast_features']}'")
        print(f"Content Features (Snippet): '{sample_row['content_features'][:150]}...'")
        print("=================================================")

if __name__ == "__main__":
    main()
