import os
import sys
import time
import json
import logging
import datetime
import urllib.request
import urllib.parse
import re
from typing import Dict, Any, List, Optional
import requests
import urllib3.util.connection as urllib_conn

logger = logging.getLogger(__name__)

# Ensure DNS-blocked TMDB domains route correctly via known direct CloudFront IP
TMDB_DIRECT_IP = "3.175.86.37"
_orig_create_conn = urllib_conn.create_connection

def _tmdb_patched_conn(address, *args, **kwargs):
    host, port = address
    if host == "api.themoviedb.org":
        host = TMDB_DIRECT_IP
    return _orig_create_conn((host, port), *args, **kwargs)

urllib_conn.create_connection = _tmdb_patched_conn

class TMDBLiveService:
    def __init__(self):
        self.api_key = os.getenv("TMDB_API_KEY", "37823decae1bace15d14103ded55d953")
        self.base_url = "https://api.themoviedb.org/3"
        self.raw_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data",
            "raw"
        )
        os.makedirs(self.raw_dir, exist_ok=True)
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = 900  # 15 minutes TTL

    def _get_cache(self, key: str) -> Optional[Any]:
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry["timestamp"] < self.cache_ttl:
                return entry["data"]
            del self.cache[key]
        return None

    def _set_cache(self, key: str, data: Any):
        self.cache[key] = {
            "data": data,
            "timestamp": time.time()
        }

    def _save_raw_movie_stub(self, movie: dict):
        """Cache minimal raw movie details locally if not already present on disk."""
        try:
            mid = movie.get("id")
            if not mid:
                return
            path = os.path.join(self.raw_dir, f"movie_{mid}.json")
            if not os.path.exists(path):
                # Format to match TMDBMovieDetails
                stub = {
                    "id": mid,
                    "title": movie.get("title", ""),
                    "original_title": movie.get("original_title", movie.get("title", "")),
                    "overview": movie.get("overview", ""),
                    "poster_path": movie.get("poster_path"),
                    "backdrop_path": movie.get("backdrop_path"),
                    "genre_ids": movie.get("genre_ids", []),
                    "genres": [{"id": gid, "name": "General"} for gid in movie.get("genre_ids", [])],
                    "release_date": movie.get("release_date", ""),
                    "vote_average": movie.get("vote_average", 0.0),
                    "vote_count": movie.get("vote_count", 0),
                    "popularity": movie.get("popularity", 0.0),
                    "status": "Released",
                    "runtime": movie.get("runtime", 120),
                    "tagline": "",
                    "budget": 0,
                    "revenue": 0,
                }
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(stub, f)
        except Exception as e:
            logger.warning(f"Error saving raw stub for {movie.get('id')}: {e}")

    def _fetch_endpoint(self, endpoint: str, params: Optional[dict] = None) -> Optional[dict]:
        query_params = {"api_key": self.api_key}
        if params:
            query_params.update(params)

        cache_key = f"{endpoint}_{json.dumps(query_params, sort_keys=True)}"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        url = f"{self.base_url}/{endpoint}"
        try:
            resp = requests.get(url, params=query_params, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                self._set_cache(cache_key, data)
                return data
            else:
                logger.warning(f"TMDB request {endpoint} returned status {resp.status_code}")
        except Exception as e:
            logger.warning(f"TMDB request failed for {endpoint}: {e}")
        return None

    def _filter_released_movies(self, raw_results: List[dict]) -> List[dict]:
        today = datetime.date.today().isoformat()
        current_year = datetime.date.today().year

        released: List[dict] = []
        for m in raw_results:
            rdate = m.get("release_date")
            if not rdate or not isinstance(rdate, str) or not rdate.strip():
                continue
            rdate = rdate.strip()
            # Must not be future date
            if rdate > today:
                continue
            # Year check
            try:
                yr = int(rdate[:4])
                if yr > current_year:
                    continue
            except (ValueError, TypeError):
                continue

            # Cache stub locally so detail lookups work instantly
            self._save_raw_movie_stub(m)
            released.append(m)

        return released

    def _fetch_paginated_released(self, endpoint: str, page: int = 1, target_count: int = 20) -> dict:
        """Fetch released movies from an endpoint, backfilling from subsequent pages if needed to reach target_count."""
        current_page = page
        released: List[dict] = []
        total_pages = 1

        while len(released) < target_count and current_page <= total_pages + 3:
            data = self._fetch_endpoint(endpoint, {"page": current_page})
            if not data or "results" not in data:
                break
            total_pages = data.get("total_pages", 1)
            page_released = self._filter_released_movies(data["results"])

            seen_ids = {m.get("id") for m in released}
            for m in page_released:
                if m.get("id") not in seen_ids:
                    released.append(m)
                    seen_ids.add(m.get("id"))
                    if len(released) >= target_count:
                        break

            if current_page >= total_pages or len(data.get("results", [])) == 0:
                break
            current_page += 1

        return {
            "page": page,
            "results": released,
            "total_pages": total_pages,
            "total_results": len(released)
        }

    def get_trending(self, page: int = 1) -> dict:
        """Fetch live trending movies of the day from TMDB."""
        return self._fetch_paginated_released("trending/movie/day", page=page, target_count=20)

    def get_new_releases(self, page: int = 1) -> dict:
        """Fetch live now-playing / newly released movies from TMDB."""
        return self._fetch_paginated_released("movie/now_playing", page=page, target_count=20)

    def get_popular(self, page: int = 1) -> dict:
        """Fetch live popular movies from TMDB."""
        return self._fetch_paginated_released("movie/popular", page=page, target_count=20)

    def get_top_rated(self, page: int = 1) -> dict:
        """Fetch live top rated movies from TMDB."""
        return self._fetch_paginated_released("movie/top_rated", page=page, target_count=20)

    def get_movie_detail(self, movie_id: int) -> Optional[dict]:
        """Fetch full movie details, caching to disk."""
        path = os.path.join(self.raw_dir, f"movie_{movie_id}.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass

        # Live fetch from TMDB
        data = self._fetch_endpoint(f"movie/{movie_id}")
        if data:
            try:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(data, f)
            except Exception as e:
                logger.warning(f"Failed to cache movie {movie_id}: {e}")
            return data
        return None

    def _search_youtube_trailer(self, title: str, year: str = "") -> List[str]:
        """Search YouTube for movie official trailer video IDs."""
        try:
            query = f"{title} {year} official trailer".strip()
            encoded = urllib.parse.quote(query)
            url = f"https://www.youtube.com/results?search_query={encoded}"
            headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                matches = re.findall(r'\"videoId\":\"([a-zA-Z0-9_-]{11})\"', html)
                if matches:
                    seen = set()
                    return [x for x in matches if not (x in seen or seen.add(x))][:3]
        except Exception as e:
            logger.warning(f"YouTube trailer search failed for {title}: {e}")
        return []

    def get_movie_videos(self, movie_id: int, title: Optional[str] = None) -> dict:
        """Fetch movie videos/trailers from TMDB with caching and YouTube search fallback."""
        cache_key = f"movie_videos_{movie_id}"
        cached = self._get_cache(cache_key)
        if cached is not None and cached.get("results"):
            return cached

        # Check local raw json first
        path = os.path.join(self.raw_dir, f"movie_{movie_id}.json")
        movie_title = title or ""
        movie_year = ""
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    movie_data = json.load(f)
                    if not movie_title:
                        movie_title = movie_data.get("title", "")
                    rdate = movie_data.get("release_date", "")
                    if rdate:
                        movie_year = rdate[:4]
                    if "videos" in movie_data and isinstance(movie_data["videos"], dict):
                        vids = movie_data["videos"].get("results", [])
                        if vids:
                            res = {"id": movie_id, "results": vids}
                            self._set_cache(cache_key, res)
                            return res
            except Exception:
                pass

        # Live TMDB fetch
        data = self._fetch_endpoint(f"movie/{movie_id}/videos")
        if data and data.get("results"):
            self._set_cache(cache_key, data)
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        movie_data = json.load(f)
                    movie_data["videos"] = data
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump(movie_data, f)
                except Exception:
                    pass
            return data

        # Fallback: Search YouTube directly using title
        if not movie_title:
            detail = self.get_movie_detail(movie_id)
            if detail:
                movie_title = detail.get("title", "")
                rdate = detail.get("release_date", "")
                if rdate:
                    movie_year = rdate[:4]

        if movie_title:
            yt_vids = self._search_youtube_trailer(movie_title, movie_year)
            if yt_vids:
                yt_results = [
                    {
                        "id": f"yt_{vid}",
                        "key": vid,
                        "name": f"{movie_title} Official Trailer",
                        "site": "YouTube",
                        "type": "Trailer",
                        "official": True
                    }
                    for vid in yt_vids
                ]
                res = {"id": movie_id, "results": yt_results}
                self._set_cache(cache_key, res)
                return res

        empty = {"id": movie_id, "results": []}
        return empty

tmdb_live_service = TMDBLiveService()
