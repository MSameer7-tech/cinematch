import os
import sys
import time
import json
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender.candidate_generator import CandidateGenerator
from app.models.recommendation_context import CandidateMovie

# Example test movies
# Interstellar (157336), The Dark Knight (155), Parasite (496243)
# Arrival (278150), The Godfather (238), Spirited Away (129), Dune (438631)
TEST_MOVIE_IDS = [157336, 155, 496243, 278150, 238, 129, 438631]

def run_benchmark():
    print("="*50)
    print("🚀 CineMatch Recommender Benchmark")
    print("="*50)

    start_time = time.time()
    
    # Initialize Engine (Loads matrix)
    print("Loading similarity matrix...")
    generator = CandidateGenerator()
    
    print(f"Dataset Size: {generator.movies_df.shape[0]} movies")
    print(f"Matrix Shape: {generator.similarity_matrix.shape}")
    
    results = {}
    
    print("\nRunning offline similarity tests...")
    for movie_id in TEST_MOVIE_IDS:
        candidates = generator.get_similar_movies([movie_id], limit=5)
        
        # Look up movie title
        movie_row = generator.movies_df[generator.movies_df['id'] == movie_id]
        title = movie_row['title'].values[0] if not movie_row.empty else f"Movie {movie_id}"
        
        results[title] = [{"id": c.movie.id, "title": c.movie.title, "score": round(c.similarity_score, 4)} for c in candidates]
        
        print(f"\n🎥 {title}")
        for c in candidates:
            print(f"   -> {c.movie.title} (Score: {c.similarity_score:.4f})")
            
    elapsed = time.time() - start_time
    
    print(f"\n✅ Benchmark completed in {elapsed:.2f} seconds.")
    
    # Save report
    os.makedirs("artifacts/metadata", exist_ok=True)
    report_path = "artifacts/metadata/benchmark_report_v1.json"
    with open(report_path, "w") as f:
        json.dump(results, f, indent=4)
        
    print(f"📄 Report saved to {report_path}")

if __name__ == "__main__":
    run_benchmark()
