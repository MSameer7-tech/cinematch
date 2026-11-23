import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from app.content.repositories.movie_repository import MovieRepository
from app.search.models.search_models import SearchIndexItem, SearchBootstrapResponse, AISearchResponse
from app.ai.clients.llm_client import llm_client
from app.ai.utils.json_parser import JSONParser
import logging

logger = logging.getLogger(__name__)

AI_SEARCH_PROMPT = """You are an AI assistant that translates natural language queries into structured search parameters for a movie database.

Analyze the user's search query and extract parameters in JSON format.

JSON Schema:
{
  "type": "filter" | "recommendation",
  "genres": list of strings (e.g. ["Action", "Science Fiction", "Comedy"]),
  "runtime_max": integer or null (e.g. 120),
  "rating_min": float or null (e.g. 7.5),
  "keywords": list of strings (e.g. ["zombie", "time travel", "space"]),
  "language": string or null (e.g. "ko", "ja", "en", "fr"),
  "year_min": integer or null,
  "year_max": integer or null,
  "seed_movies": list of movie titles to use as recommendation seeds if relevant,
  "mood": string or null (e.g. "funny", "scary", "sad")
}

Guidelines:
1. If the user is asking for recommendations similar to a movie (e.g. "movies like Interstellar"), set type to "recommendation" and populate "seed_movies" with the seed movie titles.
2. If the user is asking for specific filters (e.g. "funny space movies under two hours"), set type to "filter" and populate genres, runtime_max, keywords, rating_min, etc.
3. Be precise with translation. Extract languages to their standard ISO 639-1 code (e.g. "Korean" -> "ko", "Japanese" -> "ja", "English" -> "en").
4. Translate phrases like "under 2 hours" to runtime_max = 120. "Best rated" or "highest rating" -> rating_min = 8.0.
5. Translate genre names to the actual capitalized TMDB genre names (e.g., "Sci-Fi" -> "Science Fiction", "Rom-Com" -> "Romance", "Comedy").

Only respond with the JSON object, do not include markdown blocks or any conversational explanations."""

def to_int(val: Any, default: Optional[int] = 0) -> Optional[int]:
    if pd.isna(val) or val is None or (isinstance(val, float) and np.isnan(val)):
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default

def to_float(val: Any, default: float = 0.0) -> float:
    if pd.isna(val) or val is None or (isinstance(val, float) and np.isnan(val)):
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def split_csv(val: Any) -> List[str]:
    if pd.isna(val) or not val:
        return []
    if isinstance(val, (list, tuple)):
        return [str(v).strip() for v in val if v]
    return [item.strip() for item in str(val).split(',') if item.strip()]

class SearchService:
    def __init__(self):
        self.movie_repo = MovieRepository()
        self._cached_bootstrap: Optional[SearchBootstrapResponse] = None

    def get_bootstrap_data(self) -> SearchBootstrapResponse:
        if self._cached_bootstrap is not None:
            return self._cached_bootstrap

        df = self.movie_repo.df
        movies: List[SearchIndexItem] = []
        
        genres_set = set()
        languages_set = set()
        years_set = set()

        for idx, row in df.iterrows():
            movie_id = to_int(row['movie_id'], 0)
            if movie_id == 0:
                movie_id = int(idx)
                
            title = str(row['title']) if pd.notna(row.get('title')) else ""
            
            # Extract genres
            genre_list = split_csv(row.get('genre_names'))
            for g in genre_list:
                genres_set.add(g)

            # Extract cast
            cast_list = split_csv(row.get('cast'))

            # Extract keywords
            keyword_list = split_csv(row.get('keywords'))

            # Extract countries
            countries = split_csv(row.get('production_countries'))

            # Extract language (spoken_languages)
            lang_list = split_csv(row.get('spoken_languages'))
            lang = lang_list[0] if lang_list else "en"
            languages_set.add(lang)

            # Year
            year = to_int(row.get('release_year'), 0)
            if year > 0:
                years_set.add(year)

            # Runtime
            runtime = to_int(row.get('runtime'), None)

            # Adult
            adult = bool(row.get('adult') or False)

            item = SearchIndexItem(
                id=movie_id,
                title=title,
                original_title=title,
                alternative_titles=[],
                genres=genre_list,
                cast=cast_list,
                director=str(row.get('director')) if pd.notna(row.get('director')) and row['director'] else None,
                keywords=keyword_list,
                popularity=to_float(row.get('popularity'), 0.0),
                vote_count=to_int(row.get('vote_count'), 0),
                vote_average=to_float(row.get('vote_average'), 0.0),
                release_year=year,
                language=lang,
                runtime=runtime,
                production_countries=countries,
                adult=adult,
                media_type="movie"
            )
            movies.append(item)

        self._cached_bootstrap = SearchBootstrapResponse(
            movies=movies,
            genres=sorted(list(genres_set)),
            languages=sorted(list(languages_set)),
            years=sorted(list(years_set))
        )
        return self._cached_bootstrap

    async def parse_ai_search(self, query: str) -> AISearchResponse:
        try:
            messages = [
                {"role": "system", "content": AI_SEARCH_PROMPT},
                {"role": "user", "content": f"Translate this search query: {query}"}
            ]
            raw_response = llm_client.chat(messages=messages, json_mode=True, temperature=0.1)
            parsed_dict = JSONParser.parse_llm_json(raw_response)
            
            return AISearchResponse(
                type=parsed_dict.get("type", "filter"),
                genres=parsed_dict.get("genres") or [],
                runtime_max=parsed_dict.get("runtime_max") or parsed_dict.get("runtimeMax"),
                rating_min=parsed_dict.get("rating_min") or parsed_dict.get("ratingMin"),
                keywords=parsed_dict.get("keywords") or [],
                language=parsed_dict.get("language"),
                year_min=parsed_dict.get("year_min") or parsed_dict.get("yearMin"),
                year_max=parsed_dict.get("year_max") or parsed_dict.get("yearMax"),
                seed_movies=parsed_dict.get("seed_movies") or parsed_dict.get("seedMovies") or [],
                mood=parsed_dict.get("mood")
            )
        except Exception as e:
            logger.error(f"Failed to parse AI search query: {e}")
            return AISearchResponse(type="filter")

search_service = SearchService()
