import os
from functools import lru_cache
from dotenv import load_dotenv

# Load env variables from the parent or current directory .env
load_dotenv()

# Centralized Configurations
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Base directory for the AI Engine
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Data Directories
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
INTERMEDIATE_DATA_DIR = os.path.join(DATA_DIR, "intermediate")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
VECTORIZERS_DIR = os.path.join(ARTIFACTS_DIR, "vectorizers")
MATRICES_DIR = os.path.join(ARTIFACTS_DIR, "matrices")
METADATA_DIR = os.path.join(ARTIFACTS_DIR, "metadata")
CACHE_DIR = os.path.join(ARTIFACTS_DIR, "cache")

# Downloader Config
DATA_VERSION = "v1"
TMDB_PAGES = 250
RATE_LIMIT_DELAY = 0.05  # Sleep time between TMDB requests (seconds)
from app.models.ranking_weights import RankingWeights

# Default Ranking Weights
DEFAULT_RANKING_WEIGHTS = RankingWeights(
    similarity=0.40,
    genre_match=0.30,
    cast_crew_match=0.20,
    freshness_bonus_max=0.05,
    popularity_bonus_max=0.05
)


@lru_cache(maxsize=1)
def get_movie_features_df():
    """Load and cache the shared movie features DataFrame once per process."""
    import pandas as pd
    data_path = os.path.join(PROCESSED_DATA_DIR, f"movie_features_{DATA_VERSION}.parquet")
    return pd.read_parquet(data_path)


@lru_cache(maxsize=1)
def get_tfidf_matrix():
    """Load and cache the shared sparse TF-IDF matrix once per process."""
    import numpy as np
    import scipy.sparse as sp
    tfidf_path = os.path.join(MATRICES_DIR, f"tfidf_matrix_{DATA_VERSION}.npz")
    if not os.path.exists(tfidf_path):
        return None
    return sp.load_npz(tfidf_path).astype(np.float32)
