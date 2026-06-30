# CineMatch AI Recommendation Engine

This service handles backend machine learning, data processing, and recommendation APIs for CineMatch.

## Directory Structure

- `app/`: Source code for API server, feature builder, and recommendation system.
- `data/`: Local CSV and PKL datasets (ignored by git).
- `models/`: Trained model binaries (ignored by git).
- `notebooks/`: Jupyter notebooks for data analysis and modeling experiments.
- `scripts/`: Automation scripts for downloading data, clean-up, training, and diagnostics.
- `tests/`: Unit tests for python models and pipelines.

## Installation & Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run test scripts to verify external services:
   ```bash
   python scripts/test_tmdb.py
   python scripts/test_supabase.py
   ```
