import os
from dotenv import load_dotenv

# Load env variables from the parent or current directory .env
load_dotenv()

# Centralized Configurations
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Base directory for the AI Engine
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Data Directories
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
INTERMEDIATE_DATA_DIR = os.path.join(DATA_DIR, "intermediate")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")
ARTIFACTS_DATA_DIR = os.path.join(DATA_DIR, "artifacts")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Downloader Config
DATA_VERSION = "v1"
TMDB_PAGES = 250
RATE_LIMIT_DELAY = 0.05  # Sleep time between TMDB requests (seconds)
TOP_CAST_LIMIT = 5
