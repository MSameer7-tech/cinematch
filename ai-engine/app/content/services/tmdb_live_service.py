import os
import sys
import time
import json
import logging
import datetime
import urllib.request
import urllib.parse
import re
import math
import glob
from typing import Dict, Any, List, Optional
import requests
import urllib3.util.connection as urllib_conn

logger = logging.getLogger(__name__)

TMDB_GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
}

# Optional direct IP override for environments where api.themoviedb.org is DNS-blocked
TMDB_DIRECT_IP = os.getenv("TMDB_DIRECT_IP", "")
if TMDB_DIRECT_IP:
    _orig_create_conn = urllib_conn.create_connection

    def _tmdb_patched_conn(address, *args, **kwargs):
        host, port = address
        if host == "api.themoviedb.org":
            host = TMDB_DIRECT_IP
        return _orig_create_conn((host, port), *args, **kwargs)

    urllib_conn.create_connection = _tmdb_patched_conn

class TMDBLiveService:
    def __init__(self):
        self.api_key = os.getenv("TMDB_API_KEY", "")
        self.base_url = "https://api.themoviedb.org/3"
        self.raw_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data",
            "raw"
        )
        self.alt_raw_dir = os.path.abspath(
            os.path.join(self.raw_dir, "..", "..", "..", "data", "raw")
        )
        os.makedirs(self.raw_dir, exist_ok=True)
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = 900  # 15 minutes TTL
        self._bollywood_pool = None
        from requests.adapters import HTTPAdapter
        self.session = requests.Session()
        adapter = HTTPAdapter(pool_connections=16, pool_maxsize=16)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

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
                # Format to match TMDBMovieDetails with accurate genre mapping
                stub = {
                    "id": mid,
                    "title": movie.get("title", ""),
                    "original_title": movie.get("original_title", movie.get("title", "")),
                    "overview": movie.get("overview", ""),
                    "poster_path": movie.get("poster_path"),
                    "backdrop_path": movie.get("backdrop_path"),
                    "genre_ids": movie.get("genre_ids", []),
                    "genres": [{"id": gid, "name": TMDB_GENRE_MAP.get(gid, "Drama")} for gid in movie.get("genre_ids", [])],
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

        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            resp = self.session.get(url, params=query_params, timeout=4.0)
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

    def _fetch_paginated_released(self, endpoint: str, page: int = 1, target_count: int = 20, params: Optional[dict] = None) -> dict:
        """Fetch released movies from an endpoint, backfilling from subsequent pages if needed to reach target_count."""
        current_page = page
        released: List[dict] = []
        total_pages = 1
        base_params = dict(params) if params else {}

        while len(released) < target_count and current_page <= total_pages + 3:
            req_params = dict(base_params)
            req_params["page"] = current_page
            data = self._fetch_endpoint(endpoint, req_params)
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

    def _get_bollywood_pool(self) -> List[dict]:
        if self._bollywood_pool is not None:
            return self._bollywood_pool

        today = datetime.date.today().isoformat()
        exclude_ids = {530915, 522402, 381289, 804095, 57212, 296098, 87, 522518, 39254} # non-Indian productions

        seen_ids = set()
        pool = []
        dirs = [self.raw_dir, self.alt_raw_dir]

        for d in dirs:
            if not os.path.exists(d):
                continue
            for p in glob.glob(os.path.join(d, "movie_*.json")):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        mid = data.get("id")
                        if not mid or mid in seen_ids or mid in exclude_ids:
                            continue

                        lang = data.get("original_language", "")
                        prod_countries = [c.get("name") for c in data.get("production_countries", []) if isinstance(c, dict)]
                        is_indian = lang in ['hi', 'te', 'ta', 'ml', 'kn', 'bn', 'pa'] or 'India' in prod_countries
                        if not is_indian:
                            continue

                        rdate = data.get("release_date", "")
                        if not rdate or rdate > today:
                            continue

                        poster = data.get("poster_path")
                        if not poster:
                            continue

                        seen_ids.add(mid)

                        gids = data.get("genre_ids", [])
                        if not gids and "genres" in data:
                            gids = [g.get("id") for g in data.get("genres", []) if isinstance(g, dict) and g.get("id")]

                        pool.append({
                            "id": mid,
                            "title": data.get("title", ""),
                            "original_title": data.get("original_title", data.get("title", "")),
                            "overview": data.get("overview", ""),
                            "poster_path": poster,
                            "backdrop_path": data.get("backdrop_path"),
                            "release_date": rdate,
                            "vote_average": float(data.get("vote_average") or 0.0),
                            "vote_count": int(data.get("vote_count") or 0),
                            "popularity": float(data.get("popularity") or 0.0),
                            "genre_ids": gids,
                            "status": "Released"
                        })
                except Exception:
                    pass

        # Fallback to live TMDB Indian cinema discovery when local raw_dir is empty (e.g., Render/Docker)
        if len(pool) < 20 and self.api_key:
            for p_num in (1, 2, 3):
                data = self._fetch_endpoint("discover/movie", {
                    "with_origin_country": "IN",
                    "sort_by": "popularity.desc",
                    "release_date.lte": today,
                    "include_adult": "false",
                    "page": p_num,
                })
                if not data or not data.get("results"):
                    break
                for m in data["results"]:
                    mid = m.get("id")
                    if not mid or mid in seen_ids or mid in exclude_ids:
                        continue
                    rdate = m.get("release_date", "")
                    poster = m.get("poster_path")
                    if not rdate or rdate > today or not poster:
                        continue
                    seen_ids.add(mid)
                    self._save_raw_movie_stub(m)
                    pool.append({
                        "id": mid,
                        "title": m.get("title", ""),
                        "original_title": m.get("original_title", m.get("title", "")),
                        "overview": m.get("overview", ""),
                        "poster_path": poster,
                        "backdrop_path": m.get("backdrop_path"),
                        "release_date": rdate,
                        "vote_average": float(m.get("vote_average") or 0.0),
                        "vote_count": int(m.get("vote_count") or 0),
                        "popularity": float(m.get("popularity") or 0.0),
                        "genre_ids": m.get("genre_ids", []),
                        "status": "Released",
                    })

        self._bollywood_pool = pool
        return pool

    def get_bollywood_movies(
        self,
        page: int = 1,
        page_size: int = 20,
        genre_id: Optional[int] = None,
        category: str = "popular"
    ) -> dict:
        pool = list(self._get_bollywood_pool())

        if genre_id and int(genre_id) > 0:
            gid = int(genre_id)
            pool = [m for m in pool if gid in m.get("genre_ids", [])]

        iconic_boost = {
            579974: 1000.0, # RRR
            864692: 950.0,  # Pathaan
            19404: 900.0,   # DDLJ
            20453: 890.0,   # 3 Idiots
            360814: 880.0,  # Dangal
            781732: 870.0,  # Animal
            872906: 860.0,  # Jawan
            1112426: 850.0, # Stree 2
            348892: 840.0,  # Bajrangi Bhaijaan
            297222: 830.0,  # PK
            256040: 820.0,  # Baahubali 1
            350312: 810.0,  # Baahubali 2
            564147: 800.0,  # KGF 1
            587412: 790.0,  # KGF 2
            1029827: 780.0, # Drishyam 2
            801688: 770.0,  # Kalki 2898-AD
            7508: 760.0,    # Taare Zameen Par
            4251: 750.0,    # Veer-Zaara
            534780: 740.0,  # Andhadhun
            12259: 730.0,   # Sholay
            117691: 720.0,  # Gangs of Wasseypur
        }

        # Ensure movies with valid posters are strictly prioritized first; poster-less movies pushed to end
        def sort_key(m: dict):
            has_poster = 1 if (m.get("poster_path") and str(m.get("poster_path")).strip() and str(m.get("poster_path")).strip() != "None") else 0
            if category == "topRated":
                score = (m.get("vote_average", 0.0), m.get("vote_count", 0), m.get("popularity", 0.0))
                return (has_poster, score)
            elif category in ("upcoming", "new_releases"):
                score = (m.get("release_date", ""), m.get("popularity", 0.0))
                return (has_poster, score)
            elif category == "trending":
                score = (iconic_boost.get(m["id"], 0.0) * 0.7 + m.get("popularity", 0.0) * 0.3)
                return (has_poster, score)
            else:
                score = (iconic_boost.get(m["id"], 0.0) + m.get("popularity", 0.0))
                return (has_poster, score)

        pool.sort(key=sort_key, reverse=True)

        total = len(pool)
        total_pages = max(1, math.ceil(total / page_size))
        start = (page - 1) * page_size
        end = start + page_size
        results = pool[start:end]

        return {
            "page": page,
            "results": results,
            "total_pages": total_pages,
            "total_results": total
        }

    def discover_movies(
        self,
        page: int = 1,
        genre_id: Optional[int] = None,
        category: str = "popular",
        media_type: str = "movie",
        region: str = "all",
        include_mature: bool = True
    ) -> dict:
        """Discover movies with server-side genre, category, sorting, region focus, and mature content filtering."""
        if media_type == "bollywood" or (region == "bollywood" and media_type == "movie"):
            res = self.get_bollywood_movies(page=page, page_size=20, genre_id=genre_id, category=category)
            if not include_mature and res and "results" in res:
                res["results"] = [m for m in res["results"] if not m.get("adult")]
            return res

        if (genre_id and int(genre_id) > 0) or not include_mature:
            gid = int(genre_id) if genre_id else 0
            sort_map = {
                "popular": "popularity.desc",
                "trending": "popularity.desc",
                "topRated": "vote_average.desc",
                "upcoming": "primary_release_date.desc",
            }
            sort_by = sort_map.get(category, "popularity.desc")
            params = {
                "sort_by": sort_by,
                "include_adult": "false",
            }
            if gid > 0:
                params["with_genres"] = gid
            if not include_mature:
                params["certification_country"] = "US"
                params["certification.lte"] = "PG-13"
            if category == "topRated":
                params["vote_count.gte"] = 30
            res = self._fetch_paginated_released("discover/movie", page=page, target_count=20, params=params)
        elif category == "trending":
            res = self.get_trending(page=page)
        elif category == "topRated":
            res = self.get_top_rated(page=page)
        elif category == "upcoming":
            res = self.get_new_releases(page=page)
        else:
            res = self.get_popular(page=page)

        # Blend top Bollywood movies into general results stream only when region is 'all'
        if region == "all":
            try:
                b_data = self.get_bollywood_movies(page=page, page_size=10, genre_id=genre_id, category=category)
                b_movies = b_data.get("results", [])
                if b_movies and res and "results" in res and res["results"]:
                    existing_ids = {m.get("id") for m in res["results"]}
                    insert_indices = [3, 9, 15]
                    b_idx = 0
                    for idx in insert_indices:
                        if idx < len(res["results"]) and b_idx < len(b_movies):
                            cand = b_movies[b_idx]
                            b_idx += 1
                            if cand.get("id") not in existing_ids:
                                res["results"].insert(idx, cand)
                                existing_ids.add(cand.get("id"))
            except Exception as e:
                logger.warning(f"Failed to blend Bollywood movies: {e}")

        if not include_mature and res and "results" in res:
            res["results"] = [m for m in res["results"] if not m.get("adult")]

        return res

    def get_movie_detail(self, movie_id: int) -> Optional[dict]:
        """Fetch full movie details with credits and proper genres, caching to disk."""
        path = os.path.join(self.raw_dir, f"movie_{movie_id}.json")
        cached_data = None
        is_stub = False

        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    genres = cached_data.get("genres", [])
                    has_general = any(g.get("name") == "General" for g in genres if isinstance(g, dict))
                    has_credits = "credits" in cached_data and bool(cached_data.get("credits", {}).get("cast"))
                    if not has_general and has_credits:
                        return cached_data
                    is_stub = True
            except Exception:
                pass

        # Check secondary alt raw dir
        alt_path = os.path.join(self.alt_raw_dir, f"movie_{movie_id}.json")
        if os.path.exists(alt_path):
            try:
                with open(alt_path, "r", encoding="utf-8") as f:
                    alt_data = json.load(f)
                    alt_genres = alt_data.get("genres", [])
                    has_general = any(g.get("name") == "General" for g in alt_genres if isinstance(g, dict))
                    has_credits = "credits" in alt_data and bool(alt_data.get("credits", {}).get("cast"))
                    if not has_general and has_credits:
                        return alt_data
                    if cached_data is None:
                        cached_data = alt_data
            except Exception:
                pass

        # Live fetch from TMDB with append_to_response=credits
        data = self._fetch_endpoint(f"movie/{movie_id}", {"append_to_response": "credits"})
        if data:
            if "genres" in data:
                for g in data["genres"]:
                    if isinstance(g, dict) and (g.get("name") == "General" or not g.get("name")):
                        g["name"] = TMDB_GENRE_MAP.get(g.get("id"), "Drama")
            try:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(data, f)
            except Exception as e:
                logger.warning(f"Failed to cache movie {movie_id}: {e}")
            return data

        # If live TMDB fetch failed or was blocked, sanitize cached stub genres
        if cached_data is not None:
            if "genres" in cached_data:
                for g in cached_data["genres"]:
                    if isinstance(g, dict) and (g.get("name") == "General" or not g.get("name")):
                        g["name"] = TMDB_GENRE_MAP.get(g.get("id"), "Drama")
            return cached_data

        return None

    def get_movie_credits(self, movie_id: int) -> dict:
        """Fetch movie credits from TMDB with disk & memory caching."""
        detail = self.get_movie_detail(movie_id)
        if detail and "credits" in detail and detail["credits"]:
            return detail["credits"]

        credits_data = self._fetch_endpoint(f"movie/{movie_id}/credits")
        if credits_data:
            return credits_data

        return {"id": movie_id, "cast": [], "crew": []}

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
