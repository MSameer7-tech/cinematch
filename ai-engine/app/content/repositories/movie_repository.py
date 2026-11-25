import os
import pandas as pd
import numpy as np
from app.config import PROCESSED_DATA_DIR, DATA_VERSION, MATRICES_DIR

class MovieRepository:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        from app.config import get_movie_features_df, get_tfidf_matrix
        self.df = get_movie_features_df()
        
        # Mapping from movie_id to index and vice-versa
        self.movie_id_to_idx = {row['movie_id']: idx for idx, row in self.df.iterrows()}
        self.idx_to_movie_id = {idx: row['movie_id'] for idx, row in self.df.iterrows()}
        
        # Shared sparse TF-IDF matrix (~1.7 MB) for low-memory on-demand similarity lookup
        self.tfidf_matrix = get_tfidf_matrix()

        # ----------------------------------------------------
        # Server Startup Precomputations (Optimization Phase)
        # ----------------------------------------------------
        
        # Filter exclusively for officially released movies (release_year <= current_year and status == 'Released')
        import datetime
        current_year = datetime.datetime.now().year
        released_df = self.df[
            (self.df['status'].fillna('').str.lower() == 'released') &
            (self.df['release_year'].fillna(0) <= current_year)
        ]

        # 1. Precomputed Trending (Sort by popularity, prioritizing audience engagement)
        self.precomputed_trending = released_df.sort_values(
            by=['popularity', 'vote_count'], 
            ascending=[False, False]
        ).to_dict(orient='records')
        
        # 2. Precomputed Hidden Gems
        median_pop = released_df['popularity'].median()
        self.precomputed_hidden_gems = released_df[
            (released_df['popularity'] > 0) & 
            (released_df['popularity'] < median_pop) & 
            (released_df['vote_count'] > 10)
        ].sort_values(by='vote_average', ascending=False).to_dict(orient='records')
        
        # 3. Precomputed New Releases (recent released movies with verified engagement)
        self.precomputed_new_releases = released_df[
            (released_df['release_year'] >= current_year - 2) &
            (released_df['vote_count'] > 5)
        ].sort_values(
            by=['release_year', 'popularity'], 
            ascending=[False, False]
        ).to_dict(orient='records')
        if len(self.precomputed_new_releases) < 20:
            self.precomputed_new_releases = released_df.sort_values(
                by=['release_year', 'popularity'], 
                ascending=[False, False]
            ).to_dict(orient='records')
        
        # 4. Precomputed Genre-to-movies mapping
        self.genre_to_movies = {}
        for idx, row in released_df.iterrows():
            if pd.notna(row.get('genre_names')) and row['genre_names']:
                row_genres = [g.lower().strip() for g in row['genre_names'].split(',')]
                row_dict = row.to_dict()
                row_dict['movie_id'] = int(row_dict.get('movie_id') or idx)
                for g in row_genres:
                    if g not in self.genre_to_movies:
                        self.genre_to_movies[g] = []
                    self.genre_to_movies[g].append(row_dict)
                    
        # Sort each genre's list by quality (vote_average * 0.5 + popularity * 0.5) desc
        for g, movies_list in self.genre_to_movies.items():
            movies_list.sort(
                key=lambda x: (x.get('vote_average', 0.0) or 0.0) * 0.5 + (x.get('popularity', 0.0) or 0.0) * 0.5, 
                reverse=True
            )

    def get_movie_by_id(self, movie_id: int) -> dict:
        if movie_id in self.movie_id_to_idx:
            idx = self.movie_id_to_idx[movie_id]
            row = self.df.iloc[idx]
            return row.to_dict()
        return {}

    def get_movies_by_ids(self, movie_ids: list) -> list:
        movies = []
        for mid in movie_ids:
            movie = self.get_movie_by_id(mid)
            if movie:
                movies.append(movie)
        return movies

    def get_hidden_gems(self) -> list:
        return self.precomputed_hidden_gems

    def get_trending(self) -> list:
        return self.precomputed_trending

    def get_new_releases(self) -> list:
        return self.precomputed_new_releases

    def get_movies_by_genres(self, preferred_genres: list) -> list:
        # Collect movies from matching genres, keeping their sorted quality order
        genres_lower = [g.lower().strip() for g in preferred_genres]
        matching_movies = []
        seen_ids = set()
        
        # Merge lists from each genre
        for genre in genres_lower:
            genre_list = self.genre_to_movies.get(genre, [])
            for movie in genre_list:
                mid = movie['movie_id']
                if mid not in seen_ids:
                    seen_ids.add(mid)
                    matching_movies.append(movie)
                    
        # Re-sort to maintain overall quality ordering
        matching_movies.sort(
            key=lambda x: (x.get('vote_average', 0.0) or 0.0) * 0.5 + (x.get('popularity', 0.0) or 0.0) * 0.5, 
            reverse=True
        )
        return matching_movies

    def get_similar_movies(self, movie_id: int, limit: int = 100) -> list:
        if self.tfidf_matrix is None or movie_id not in self.movie_id_to_idx:
            return []
            
        seed_idx = self.movie_id_to_idx[movie_id]
        sim_scores = (self.tfidf_matrix @ self.tfidf_matrix[seed_idx].T).toarray().ravel()
        
        # Get top indices (excluding self)
        top_indices = np.argsort(sim_scores)[::-1]
        similar_movies = []
        
        for idx in top_indices:
            candidate_id = self.idx_to_movie_id[idx]
            if candidate_id == movie_id:
                continue
            similar_movies.append(self.df.iloc[idx].to_dict())
            if len(similar_movies) >= limit:
                break
                
        return similar_movies
