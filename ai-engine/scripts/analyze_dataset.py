import os
import sys
import argparse
from collections import Counter
import pandas as pd

# Add parent directory to python path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import config

def main():
    parser = argparse.ArgumentParser(description="Analyze movie dataset features and quality metrics.")
    parser.add_argument("--version", type=str, default=config.DATA_VERSION,
                        help=f"Dataset version suffix (default: {config.DATA_VERSION})")
    args = parser.parse_args()
    
    # Path to processed Parquet file (contains all raw and engineered attributes)
    parquet_filename = f"movie_features_{args.version}.parquet"
    parquet_filepath = os.path.join(config.PROCESSED_DATA_DIR, parquet_filename)
    
    if not os.path.exists(parquet_filepath):
        print(f"Error: Processed parquet file not found at: {parquet_filepath}. Run feature_builder.py first.")
        sys.exit(1)
        
    df = pd.read_parquet(parquet_filepath)
    total_movies = len(df)
    
    print("Analyzing dataset...")
    
    # 1. Genres Analysis
    all_genres = []
    for genres in df["genre_names"].dropna():
        if str(genres).strip() != "":
            all_genres.extend([g.strip() for g in str(genres).split(",")])
    genre_counts = Counter(all_genres).most_common(10)
    
    # 2. Average Runtime
    avg_runtime = df["runtime"].mean()
    
    # 3. Average Metadata Score
    avg_metadata_score = df["metadata_score"].mean()
    
    # 4. Decade Analysis
    decades = []
    for year in df["release_year"].dropna():
        decade = int(year // 10 * 10)
        decades.append(f"{decade}s")
    decade_counts = Counter(decades).most_common()
    decade_counts.sort(key=lambda x: x[0])  # Sort chronologically
    
    # 5. Top Languages
    all_languages = []
    for languages in df["spoken_languages"].dropna():
        if str(languages).strip() != "":
            all_languages.extend([lang.strip() for lang in str(languages).split(",")])
    lang_counts = Counter(all_languages).most_common(10)
    
    # 6. Top Directors
    directors = [d.strip() for d in df["director"].dropna() if str(d).strip() != ""]
    director_counts = Counter(directors).most_common(10)
    
    # 7. Popularity stats
    avg_popularity = df["popularity"].mean()
    avg_rating = df["vote_average"].mean()
    avg_vote_count = df["vote_count"].mean()

    # Formulate analysis report
    report = f"""
=========================================
          DATASET ANALYTICS REPORT
=========================================
Total Movies Analysed: {total_movies}
-----------------------------------------
Average Runtime        : {avg_runtime:.1f} min
Average Metadata Score : {avg_metadata_score:.2f} / 5.0
Average Popularity     : {avg_popularity:.2f}
Average Vote Rating    : {avg_rating:.2f} / 10.0
Average Vote Count     : {avg_vote_count:.0f}
-----------------------------------------
Most Common Genres:
"""
    for genre, count in genre_counts:
        report += f"  - {genre:<20}: {count} movies ({count/total_movies*100:.1f}%)\n"
        
    report += "\nMovies by Decade:\n"
    for decade, count in decade_counts:
        report += f"  - {decade:<20}: {count} movies ({count/total_movies*100:.1f}%)\n"
        
    report += "\nTop Spoken Languages:\n"
    for lang, count in lang_counts:
        report += f"  - {lang:<20}: {count} movies ({count/total_movies*100:.1f}%)\n"
        
    report += "\nTop Directors:\n"
    for director, count in director_counts:
        report += f"  - {director:<20}: {count} movies\n"
        
    report += "=========================================\n"
    
    # Output to console
    print(report)
    
    # Save report to docs/
    docs_dir = os.path.join(os.path.dirname(config.BASE_DIR), "docs")
    os.makedirs(docs_dir, exist_ok=True)
    report_filename = f"11-Dataset-Analysis-{args.version}.md"
    report_filepath = os.path.join(docs_dir, report_filename)
    
    with open(report_filepath, "w", encoding="utf-8") as f:
        f.write(report)
        
    print(f"Analysis saved as documentation to: {report_filepath}")

if __name__ == "__main__":
    main()
