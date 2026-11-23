import numpy as np
import scipy.sparse as sp
import os
import time
from sklearn.metrics.pairwise import cosine_similarity
import sys

# Ensure ai-engine is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import MATRICES_DIR, DATA_VERSION

def build_similarity():
    matrix_path = os.path.join(MATRICES_DIR, f"tfidf_matrix_{DATA_VERSION}.npz")
    print(f"Loading TF-IDF matrix from {matrix_path}...")
    
    tfidf_matrix = sp.load_npz(matrix_path)
    
    print("Calculating cosine similarity matrix...")
    start_time = time.time()
    
    # Cosine similarity on sparse matrices returns a dense numpy array
    similarity_matrix = cosine_similarity(tfidf_matrix)
    
    end_time = time.time()
    
    print(f"Similarity matrix shape: {similarity_matrix.shape}")
    print(f"Calculation time: {end_time - start_time:.2f} seconds")
    
    similarity_path = os.path.join(MATRICES_DIR, f"cosine_similarity_{DATA_VERSION}.npy")
    print(f"Saving similarity matrix to {similarity_path}...")
    np.save(similarity_path, similarity_matrix)
    
    print("Stage 6 (Build Similarity Matrix) complete.")

if __name__ == "__main__":
    build_similarity()
