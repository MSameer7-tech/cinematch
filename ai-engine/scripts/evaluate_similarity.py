import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import MATRICES_DIR, PROCESSED_DATA_DIR, DATA_VERSION

def get_recommendations(title, df, similarity_matrix, top_n=10):
    # Find movie index
    idx_list = df.index[df['title'].str.lower() == title.lower()].tolist()
    
    if not idx_list:
        print(f"Movie '{title}' not found in the dataset.")
        return
        
    idx = idx_list[0]
    
    # Get similarity scores for this movie
    sim_scores = list(enumerate(similarity_matrix[idx]))
    
    # Sort movies based on similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get top N similar movies (excluding itself at index 0)
    sim_scores = sim_scores[1:top_n+1]
    
    print(f"\nTop {top_n} Recommendations for '{df.iloc[idx]['title']}':")
    print("-" * 60)
    
    for i, (movie_idx, score) in enumerate(sim_scores):
        rec_title = df.iloc[movie_idx]['title']
        genres = df.iloc[movie_idx]['genre_names']
        print(f"{i+1}. {rec_title} (Score: {score:.4f}) - Genres: {genres}")
        
def evaluate():
    print("Loading datasets...")
    data_path = os.path.join(PROCESSED_DATA_DIR, f"movie_features_{DATA_VERSION}.parquet")
    df = pd.read_parquet(data_path)
    
    sim_path = os.path.join(MATRICES_DIR, f"cosine_similarity_{DATA_VERSION}.npy")
    similarity_matrix = np.load(sim_path)
    
    print("Running evaluations...\n")
    # Evaluate with a few iconic movies
    test_movies = [
        "Interstellar",
        "The Matrix",
        "The Dark Knight",
        "Toy Story",
        "Parasite"
    ]
    
    for movie in test_movies:
        get_recommendations(movie, df, similarity_matrix)

if __name__ == "__main__":
    evaluate()
