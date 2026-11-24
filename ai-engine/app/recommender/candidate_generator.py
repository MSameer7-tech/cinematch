import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.recommendation_context import RecommendationContext
from app.models.recommender_models import CandidateMovie
from app.config import MATRICES_DIR, PROCESSED_DATA_DIR, DATA_VERSION

class CandidateGenerator:
    def __init__(self):
        # Load dataset
        data_path = os.path.join(PROCESSED_DATA_DIR, f"movie_features_{DATA_VERSION}.parquet")
        self.df = pd.read_parquet(data_path)
        
        # Build mapping from movie_id to index and vice-versa
        # Note: the dataframe index matches the similarity matrix row index
        self.movie_id_to_idx = {row['movie_id']: idx for idx, row in self.df.iterrows()}
        self.idx_to_movie_id = {idx: row['movie_id'] for idx, row in self.df.iterrows()}
        
        # Load similarity matrix
        sim_path = os.path.join(MATRICES_DIR, f"cosine_similarity_{DATA_VERSION}.npy")
        self.similarity_matrix = np.load(sim_path)
        
    def build_seed_movies(self, context: RecommendationContext) -> set:
        """
        Aggregate all positive signals to create a set of seed movie IDs.
        Priority order: Favorites, Ratings >= 8, Watchlist.
        Fallback to Recently Viewed only if no explicit positive signals exist.
        """
        seeds = set()
        profile = context.profile
        seeds.update(profile.favorite_movie_ids)
        seeds.update(profile.highly_rated_movie_ids)
        seeds.update(profile.watchlist_movie_ids)
        
        # Fallback to recently viewed if no explicit signals exist
        if not seeds:
            seeds.update(profile.recent_movie_ids)
            
        # Fallback for new users / cold start: seed with highest-rated popular movies
        if not seeds:
            top_movies = self.df[self.df['vote_count'] >= 500].sort_values(
                by=['vote_average', 'popularity'], ascending=[False, False]
            ).head(5)
            seeds.update(top_movies['movie_id'].tolist())
            
        return seeds

    def generate_candidates(self, context: RecommendationContext, top_k_per_seed: int = 30, request: any = None) -> None:
        """
        Populates context.candidates with the top similar movies from the seed movies.
        Prioritizes explicit request seeds and genre seeds when available.
        """
        seeds = set()
        if request and getattr(request, 'seed_movies', None):
            seeds.update(request.seed_movies)
        elif request and getattr(request, 'preferred_genres', None) and request.preferred_genres:
            # Seed with top-rated, proven films from the user's requested genres
            for g in request.preferred_genres:
                genre_matches = self.df[
                    self.df['genre_names'].str.contains(g, case=False, na=False) &
                    (self.df['vote_count'] >= 500) &
                    (self.df['vote_average'] >= 7.2)
                ].sort_values(by=['vote_average', 'vote_count'], ascending=[False, False]).head(3)
                seeds.update(genre_matches['movie_id'].tolist())
            # Complement with taste profile signals
            profile_seeds = self.build_seed_movies(context)
            seeds.update(list(profile_seeds)[:3])
        else:
            seeds = self.build_seed_movies(context)

        candidates_dict = {} # movie_id -> CandidateMovie
        
        for seed_id in seeds:
            if seed_id not in self.movie_id_to_idx:
                continue
                
            seed_idx = self.movie_id_to_idx[seed_id]
            sim_scores = self.similarity_matrix[seed_idx]
            
            # Get top K indices
            top_indices = np.argsort(sim_scores)[-(top_k_per_seed + 1):][::-1]
            
            for candidate_idx in top_indices:
                candidate_id = self.idx_to_movie_id[candidate_idx]
                score = sim_scores[candidate_idx]
                
                # Don't add the seed movie itself to candidates unless explicitly desired
                if candidate_id == seed_id:
                    continue
                    
                # Update if new similarity score is higher
                if candidate_id in candidates_dict:
                    if score > candidates_dict[candidate_id].base_similarity:
                        candidates_dict[candidate_id].base_similarity = score
                        candidates_dict[candidate_id].seed_movie_id = seed_id
                else:
                    # Create new candidate
                    row = self.df.iloc[candidate_idx]
                    
                    genres = [g.strip() for g in row['genre_names'].split(',')] if pd.notna(row.get('genre_names')) and row['genre_names'] else []
                    directors = [row['director'].strip()] if pd.notna(row.get('director')) and row['director'] else []
                    actors = [a.strip() for a in row['cast'].split(',')] if pd.notna(row.get('cast')) and row['cast'] else []
                    
                    # Safe parse release year
                    try:
                        release_year = int(row['release_year']) if pd.notna(row.get('release_year')) else None
                    except ValueError:
                        release_year = None
                        
                    status = str(row['status']).strip() if pd.notna(row.get('status')) else None
                    popularity = float(row['popularity']) if pd.notna(row.get('popularity')) else 0.0
                    vote_average = float(row['vote_average']) if pd.notna(row.get('vote_average')) else 0.0
                    vote_count = float(row['vote_count']) if pd.notna(row.get('vote_count')) else 0.0
                    metadata_score = int(row['metadata_score']) if pd.notna(row.get('metadata_score')) else 0
                    adult = bool(row['adult']) if pd.notna(row.get('adult')) else False
                    spoken_langs = [l.strip() for l in row['spoken_languages'].split(',')] if pd.notna(row.get('spoken_languages')) and row['spoken_languages'] else []
                    
                    candidates_dict[candidate_id] = CandidateMovie(
                        movie_id=candidate_id,
                        base_similarity=score,
                        seed_movie_id=seed_id,
                        genres=genres,
                        directors=directors,
                        actors=actors,
                        release_year=release_year,
                        status=status,
                        popularity=popularity,
                        vote_average=vote_average,
                        vote_count=vote_count,
                        metadata_score=metadata_score,
                        adult=adult,
                        spoken_languages=spoken_langs
                    )
                    
        context.candidates = list(candidates_dict.values())
