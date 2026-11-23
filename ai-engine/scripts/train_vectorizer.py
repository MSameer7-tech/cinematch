import pandas as pd
import numpy as np
import scipy.sparse as sp
import joblib
import json
import os
import time
import sys
from sklearn.feature_extraction.text import TfidfVectorizer

# Ensure ai-engine is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import (
    PROCESSED_DATA_DIR, 
    VECTORIZERS_DIR, 
    MATRICES_DIR, 
    METADATA_DIR, 
    DATA_VERSION
)

def train_vectorizer():
    data_path = os.path.join(PROCESSED_DATA_DIR, f"movie_features_{DATA_VERSION}.parquet")
    print(f"Loading data from {data_path}...")
    
    df = pd.read_parquet(data_path)
    
    # Ensure there are no nulls in content_features
    df["content_features"] = df["content_features"].fillna("")
    
    print("Training TF-IDF Vectorizer...")
    start_time = time.time()
    
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.8,
        sublinear_tf=True
    )
    
    tfidf_matrix = vectorizer.fit_transform(df["content_features"])
    
    end_time = time.time()
    training_time = end_time - start_time
    
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
    
    # Save artifacts
    vectorizer_path = os.path.join(VECTORIZERS_DIR, f"tfidf_vectorizer_{DATA_VERSION}.pkl")
    matrix_path = os.path.join(MATRICES_DIR, f"tfidf_matrix_{DATA_VERSION}.npz")
    metadata_path = os.path.join(METADATA_DIR, f"model_info_{DATA_VERSION}.json")
    
    print(f"Saving vectorizer to {vectorizer_path}...")
    joblib.dump(vectorizer, vectorizer_path)
    
    print(f"Saving matrix to {matrix_path}...")
    sp.save_npz(matrix_path, tfidf_matrix)
    
    # Model card / metadata
    metadata = {
        "model_type": "TfidfVectorizer",
        "data_version": DATA_VERSION,
        "hyperparameters": {
            "stop_words": "english",
            "ngram_range": [1, 2],
            "min_df": 2,
            "max_df": 0.8,
            "sublinear_tf": True
        },
        "vocabulary_size": len(vectorizer.vocabulary_),
        "matrix_shape": tfidf_matrix.shape,
        "training_time_seconds": round(training_time, 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    
    print(f"Saving metadata to {metadata_path}...")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("Stage 5 (TF-IDF Vectorization) complete.")

if __name__ == "__main__":
    train_vectorizer()
