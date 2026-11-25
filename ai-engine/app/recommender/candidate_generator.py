import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.recommendation_context import RecommendationContext
from app.models.recommender_models import CandidateMovie
from app.config import MATRICES_DIR, PROCESSED_DATA_DIR, DATA_VERSION

def get_language_filter_mask(df, language_str: str):
    if not language_str:
        return None
    lang_lower = language_str.strip().lower()
    
    if "hindi" in lang_lower or "indian" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('हिन्दी|Hindi', case=False, na=False) & df['production_countries'].astype(str).str.contains('India', case=False, na=False)
    elif "korean" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('한국어', na=False) | df['production_countries'].astype(str).str.contains('South Korea', case=False, na=False)
    elif "japanese" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('日本語', na=False) | df['production_countries'].astype(str).str.contains('Japan', case=False, na=False)
    elif "french" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('Français|French', case=False, na=False) | df['production_countries'].astype(str).str.contains('France', case=False, na=False)
    elif "spanish" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('Español|Spanish', case=False, na=False) | df['production_countries'].astype(str).str.contains('Spain|Mexico|Argentina', case=False, na=False)
    elif "german" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('Deutsch|German', case=False, na=False) | df['production_countries'].astype(str).str.contains('Germany', case=False, na=False)
    elif "italian" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('Italiano|Italian', case=False, na=False) | df['production_countries'].astype(str).str.contains('Italy', case=False, na=False)
    elif "chinese" in lang_lower or "mandarin" in lang_lower or "cantonese" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('普通话|广州话 / 廣州話|Chinese|Cantonese', case=False, na=False) | df['production_countries'].astype(str).str.contains('China|Hong Kong|Taiwan', case=False, na=False)
    elif "russian" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('Pусский|Russian', case=False, na=False) | df['production_countries'].astype(str).str.contains('Russia', case=False, na=False)
    elif "tamil" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('தமிழ்|Tamil', case=False, na=False)
    elif "telugu" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('తెలుగు|Telugu', case=False, na=False)
    elif "english" in lang_lower:
        return df['spoken_languages'].astype(str).str.contains('English', case=False, na=False)
    else:
        return df['spoken_languages'].astype(str).str.contains(lang_lower, case=False, na=False)

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
        Prioritizes explicit request seeds, language seeds, and genre seeds when available.
        """
        seeds = set()
        req_lang = getattr(request, 'language', None) if request else None

        if request and getattr(request, 'seed_movies', None):
            seeds.update(request.seed_movies)
        elif req_lang:
            lang_mask = get_language_filter_mask(self.df, req_lang)
            if lang_mask is not None and lang_mask.any():
                if getattr(request, 'preferred_genres', None) and request.preferred_genres:
                    for g in request.preferred_genres:
                        g_mask = lang_mask & self.df['genre_names'].str.contains(g, case=False, na=False)
                        if g_mask.any():
                            matches = self.df[g_mask].sort_values(by=['vote_average', 'vote_count'], ascending=[False, False]).head(5)
                            seeds.update(matches['movie_id'].tolist())
                if not seeds:
                    matches = self.df[lang_mask].sort_values(by=['vote_average', 'vote_count'], ascending=[False, False]).head(5)
                    seeds.update(matches['movie_id'].tolist())
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

        # If language requested, guarantee the top direct matches are present in candidates_dict
        if req_lang:
            lang_mask = get_language_filter_mask(self.df, req_lang)
            if lang_mask is not None and lang_mask.any():
                matches_df = self.df[lang_mask]
                if getattr(request, 'preferred_genres', None) and request.preferred_genres:
                    genre_filter = matches_df['genre_names'].apply(
                        lambda gn: any(g.lower() in str(gn).lower() for g in request.preferred_genres)
                    )
                    if genre_filter.any():
                        matches_df = matches_df[genre_filter]

                top_direct = matches_df.sort_values(by=['vote_average', 'vote_count', 'popularity'], ascending=[False, False, False]).head(25)
                for _, row in top_direct.iterrows():
                    cid = int(row['movie_id'])
                    genres = [g.strip() for g in row['genre_names'].split(',')] if pd.notna(row.get('genre_names')) and row['genre_names'] else []
                    directors = [row['director'].strip()] if pd.notna(row.get('director')) and row['director'] else []
                    actors = [a.strip() for a in row['cast'].split(',')] if pd.notna(row.get('cast')) and row['cast'] else []
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
                    countries = [c.strip() for c in row['production_countries'].split(',')] if pd.notna(row.get('production_countries')) and row['production_countries'] else []

                    candidates_dict[cid] = CandidateMovie(
                        movie_id=cid,
                        base_similarity=0.88,
                        seed_movie_id=None,
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
                        spoken_languages=spoken_langs,
                        production_countries=countries
                    )
        
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
                    countries = [c.strip() for c in row['production_countries'].split(',')] if pd.notna(row.get('production_countries')) and row['production_countries'] else []

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
                        spoken_languages=spoken_langs,
                        production_countries=countries
                    )
                    
        context.candidates = list(candidates_dict.values())
