import os
import sys
import time
import json
import logging
from collections import Counter
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

# Ensure app is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.content.repositories.user_repository import UserRepository
from app.content.repositories.movie_repository import MovieRepository

logger = logging.getLogger(__name__)

class TasteProfileDocument(BaseModel):
    user_id: str
    persona_title: str
    critic_style: str
    summary: str
    average_rating: float = 0.0
    total_ratings: int = 0
    total_favorites: int = 0
    total_watchlist: int = 0
    top_genres: List[Dict[str, Any]] = Field(default_factory=list)
    avoid_genres: List[str] = Field(default_factory=list)
    favorite_directors: List[str] = Field(default_factory=list)
    favorite_actors: List[str] = Field(default_factory=list)
    top_rated_movies: List[Dict[str, Any]] = Field(default_factory=list)
    favorite_movies: List[Dict[str, Any]] = Field(default_factory=list)
    watchlist_movies: List[Dict[str, Any]] = Field(default_factory=list)
    thematic_tags: List[str] = Field(default_factory=list)
    taste_document_text: str = ""

class DetailEngine:
    def __init__(self):
        self.user_repo = UserRepository()
        self.movie_repo = MovieRepository()
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = 900  # 15 minutes TTL

    def _resolve_movie(self, movie_id: int) -> dict:
        """Resolve movie attributes from local parquet, raw json, or TMDB live."""
        m = self.movie_repo.get_movie_by_id(movie_id)
        if m and m.get("title"):
            genres = []
            if m.get("genre_names"):
                genres = [g.strip() for g in str(m["genre_names"]).split(",") if g.strip()]
            
            cast_list = []
            if m.get("cast"):
                cast_list = [c.strip() for c in str(m["cast"]).split(",") if c.strip()][:5]
                
            return {
                "id": movie_id,
                "title": m.get("title", ""),
                "genres": genres,
                "director": m.get("director") or "",
                "cast": cast_list,
                "release_year": str(m.get("release_year") or ""),
                "vote_average": float(m.get("vote_average") or 0.0),
                "overview": m.get("overview") or "",
            }

        # Check local raw json
        raw_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data", "raw", f"movie_{movie_id}.json"
        )
        if os.path.exists(raw_path):
            try:
                with open(raw_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    genres = [g.get("name") for g in data.get("genres", []) if isinstance(g, dict) and g.get("name")]
                    rdate = data.get("release_date", "")
                    year = rdate[:4] if rdate else ""
                    return {
                        "id": movie_id,
                        "title": data.get("title", ""),
                        "genres": genres,
                        "director": "",
                        "cast": [],
                        "release_year": year,
                        "vote_average": float(data.get("vote_average") or 0.0),
                        "overview": data.get("overview") or "",
                    }
            except Exception:
                pass

        # TMDB Live fallback
        try:
            from app.content.services.tmdb_live_service import tmdb_live_service
            data = tmdb_live_service.get_movie_detail(movie_id)
            if data:
                genres = [g.get("name") for g in data.get("genres", []) if isinstance(g, dict) and g.get("name")]
                rdate = data.get("release_date", "")
                year = rdate[:4] if rdate else ""
                return {
                    "id": movie_id,
                    "title": data.get("title", ""),
                    "genres": genres,
                    "director": "",
                    "cast": [],
                    "release_year": year,
                    "vote_average": float(data.get("vote_average") or 0.0),
                    "overview": data.get("overview") or "",
                }
        except Exception:
            pass

        return {
            "id": movie_id,
            "title": f"Movie #{movie_id}",
            "genres": [],
            "director": "",
            "cast": [],
            "release_year": "",
            "vote_average": 0.0,
            "overview": "",
        }

    def _determine_persona(self, top_genres: List[str], top_directors: List[str], avg_rating: float) -> str:
        """Synthesizes a compelling cinematic archetype / persona title."""
        if not top_genres:
            return "Emerging Cinema Explorer"

        g1 = top_genres[0].lower() if len(top_genres) > 0 else ""
        g2 = top_genres[1].lower() if len(top_genres) > 1 else ""

        genre_set = {g1, g2}
        if "science fiction" in genre_set or "sci-fi" in genre_set:
            if "thriller" in genre_set or "mystery" in genre_set:
                return "Cerebral Sci-Fi & Mind-Bending Mystery Connoisseur"
            if "action" in genre_set or "adventure" in genre_set:
                return "Futuristic Sci-Fi & Space Epic Enthusiast"
            return "Visionary Sci-Fi Aficionado"

        if "action" in genre_set:
            if "thriller" in genre_set or "crime" in genre_set:
                return "High-Stakes Action & Gritty Crime Devotee"
            if "adventure" in genre_set:
                return "Epic Adventure & Blockbuster Spectacle Fan"
            return "Action Cinema & Adrenaline Seeker"

        if "drama" in genre_set:
            if "romance" in genre_set:
                return "Emotional Drama & Heartfelt Romance Admirer"
            if "history" in genre_set or "biography" in genre_set:
                return "Historical Epic & Character Study Connoisseur"
            return "Introspective Drama & Narrative Masterpiece Admirer"

        if "horror" in genre_set:
            if "mystery" in genre_set or "thriller" in genre_set:
                return "Atmospheric Horror & Psychological Thriller Investigator"
            return "Chilling Horror & Dark Cinema Devotee"

        if "comedy" in genre_set:
            if "romance" in genre_set:
                return "Charming Rom-Com & Lighthearted Cinema Lover"
            return "Clever Comedy & High-Spirited Entertainment Fan"

        if "animation" in genre_set or "family" in genre_set:
            return "Whimsical Animation & Visual Storytelling Aficionado"

        if "crime" in genre_set or "mystery" in genre_set:
            return "Noir Crime & Gripping Detective Mystery Sleuth"

        return f"{top_genres[0]} & Cinematic Storytelling Enthusiast"

    def _extract_thematic_tags(self, movies: List[dict]) -> List[str]:
        """Extract recurring keywords or narrative vibes from movie synopses."""
        keyword_patterns = {
            "mind-bending": ["mind", "reality", "dream", "memory", "simulation", "matrix", "illusion"],
            "space exploration": ["space", "galaxy", "orbit", "astronaut", "mars", "interstellar", "planet"],
            "time travel": ["time", "timeline", "future", "past", "travel", "loop"],
            "heist & strategy": ["heist", "robbery", "con", "steal", "plan", "crew"],
            "dystopian": ["dystopia", "ruins", "regime", "survival", "apocalypse", "post-apocalyptic"],
            "gritty crime": ["mafia", "gang", "detective", "underworld", "murder", "cartel", "cop"],
            "philosophical": ["philosophical", "destiny", "humanity", "existence", "soul", "purpose"],
            "supernatural": ["ghost", "demon", "curse", "haunted", "spirit", "evil"],
            "coming-of-age": ["childhood", "youth", "school", "grow", "adolescence"],
            "heroic journey": ["hero", "save", "battle", "kingdom", "quest", "destiny", "villain"],
        }
        
        counts = Counter()
        for m in movies:
            text = (m.get("overview", "") + " " + m.get("title", "")).lower()
            for tag, words in keyword_patterns.items():
                if any(w in text for w in words):
                    counts[tag] += 1
                    
        return [tag for tag, _ in counts.most_common(5)]

    def build_taste_document(self, user_id: str) -> TasteProfileDocument:
        """Assembles user ratings, likes, watchlist, and generates full taste document."""
        ratings_raw = self.user_repo.get_user_ratings(user_id)
        favorites_raw = self.user_repo.get_user_favorites(user_id)
        watchlist_raw = self.user_repo.get_user_watchlist(user_id)
        preferences_raw = self.user_repo.get_user_preferences(user_id)

        # 1. Process Ratings
        rated_movies = []
        rating_scores = []
        high_rated_movies = []
        low_rated_movies = []

        genre_weights = Counter()
        director_counter = Counter()
        actor_counter = Counter()

        for r in ratings_raw:
            mid = r.get("media_id") or r.get("movie_id")
            score = float(r.get("rating") or 0.0)
            if not mid:
                continue
            rating_scores.append(score)
            movie = self._resolve_movie(int(mid))
            movie["user_rating"] = score
            rated_movies.append(movie)

            # Weight signals
            if score >= 9.0:
                high_rated_movies.append(movie)
                for g in movie["genres"]:
                    genre_weights[g] += 3.5
                if movie["director"]:
                    director_counter[movie["director"]] += 3
                for a in movie["cast"]:
                    actor_counter[a] += 2
            elif score >= 7.0:
                high_rated_movies.append(movie)
                for g in movie["genres"]:
                    genre_weights[g] += 2.0
                if movie["director"]:
                    director_counter[movie["director"]] += 2
                for a in movie["cast"]:
                    actor_counter[a] += 1
            elif score <= 4.0:
                low_rated_movies.append(movie)
                for g in movie["genres"]:
                    genre_weights[g] -= 2.5
            elif score <= 6.0:
                for g in movie["genres"]:
                    genre_weights[g] -= 0.5

        # 2. Process Favorites
        favorite_movies = []
        for mid in favorites_raw:
            if not mid:
                continue
            movie = self._resolve_movie(int(mid))
            favorite_movies.append(movie)
            for g in movie["genres"]:
                genre_weights[g] += 2.8
            if movie["director"]:
                director_counter[movie["director"]] += 2.5
            for a in movie["cast"]:
                actor_counter[a] += 1.5

        # 3. Process Watchlist
        watchlist_movies = []
        for mid in watchlist_raw:
            if not mid:
                continue
            movie = self._resolve_movie(int(mid))
            watchlist_movies.append(movie)
            for g in movie["genres"]:
                genre_weights[g] += 1.2
            if movie["director"]:
                director_counter[movie["director"]] += 1.0

        # 4. Compute Statistical Aggregations
        total_ratings = len(rating_scores)
        avg_rating = round(sum(rating_scores) / total_ratings, 1) if total_ratings > 0 else 0.0

        if avg_rating >= 8.2:
            critic_style = "Enthusiastic Cinephile (rates generously, loves emotionally resonant cinema)"
        elif avg_rating <= 6.5 and total_ratings > 0:
            critic_style = "Discerning & Demanding Critic (high standards, selective praise)"
        elif total_ratings > 0:
            critic_style = "Balanced & Nuanced Reviewer"
        else:
            critic_style = "Explorer (building initial library)"

        # Sort and percentage top genres
        positive_genres = [(g, w) for g, w in genre_weights.items() if w > 0]
        positive_genres.sort(key=lambda x: x[1], reverse=True)
        total_positive_weight = sum([w for _, w in positive_genres]) or 1.0

        top_genres = [
            {"name": g, "percentage": round((w / total_positive_weight) * 100, 1)}
            for g, w in positive_genres[:8]
        ]
        top_genre_names = [g["name"] for g in top_genres]

        avoid_genres = [g for g, w in genre_weights.items() if w < 0]

        favorite_directors = [d for d, _ in director_counter.most_common(5) if d]
        favorite_actors = [a for a, _ in actor_counter.most_common(8) if a]

        # Persona title
        persona_title = self._determine_persona(top_genre_names, favorite_directors, avg_rating)

        # Thematic tags
        all_liked = high_rated_movies + favorite_movies
        thematic_tags = self._extract_thematic_tags(all_liked)

        # Summary Generation
        if top_genre_names:
            summary = (
                f"User demonstrates a pronounced preference for {', '.join(top_genre_names[:3])}. "
                f"They hold an average rating of {avg_rating}/10 across {total_ratings} evaluated films. "
                f"Their cinematic archetype is '{persona_title}'."
            )
        else:
            summary = "User is newly active on CineMatch. Ready to discover their unique tastes."

        # Format full Markdown Document for Chatbot & Prompt Context
        markdown_lines = [
            "# USER TASTE PROFILE DOCUMENT",
            f"**User ID:** {user_id}",
            f"**Cinematic Persona:** {persona_title}",
            f"**Critic Style:** {critic_style}",
            f"**Activity Stats:** {total_ratings} Rated ({avg_rating}/10 avg) | {len(favorite_movies)} Favorites | {len(watchlist_movies)} Watchlist",
            "",
            "## 1. Executive Taste Summary",
            summary,
            "",
            "## 2. Genre Affinity Distribution",
        ]

        if top_genres:
            for g in top_genres:
                markdown_lines.append(f"- **{g['name']}**: {g['percentage']}% affinity")
        else:
            markdown_lines.append("- No explicit genre affinity recorded yet.")

        if avoid_genres:
            markdown_lines.append(f"\n**Avoid / Low-Affinity Genres:** {', '.join(avoid_genres)}")

        markdown_lines.append("\n## 3. Top Rated & Favorite Films")
        if favorite_movies:
            for m in favorite_movies[:6]:
                dir_info = f" | Dir: {m['director']}" if m.get("director") else ""
                genre_info = f" ({', '.join(m['genres'][:3])})" if m.get("genres") else ""
                markdown_lines.append(f"- ❤️ **{m['title']}**{genre_info}{dir_info}")

        if high_rated_movies:
            for m in high_rated_movies[:6]:
                if m not in favorite_movies:
                    score = m.get("user_rating", 8.0)
                    dir_info = f" | Dir: {m['director']}" if m.get("director") else ""
                    markdown_lines.append(f"- ⭐ **{m['title']}** (Rated: {score}/10){dir_info}")

        if not favorite_movies and not high_rated_movies:
            markdown_lines.append("- No favorite or high-rated films logged yet.")

        markdown_lines.append("\n## 4. Current Watchlist Priorities")
        if watchlist_movies:
            for m in watchlist_movies[:6]:
                genre_info = f" ({', '.join(m['genres'][:2])})" if m.get("genres") else ""
                markdown_lines.append(f"- 📌 **{m['title']}**{genre_info}")
        else:
            markdown_lines.append("- Watchlist is currently empty.")

        if favorite_directors:
            markdown_lines.append(f"\n## 5. Preferred Directors & Visionaries\n- {', '.join(favorite_directors)}")

        if favorite_actors:
            markdown_lines.append(f"\n## 6. Favored Cast & Performers\n- {', '.join(favorite_actors)}")

        if thematic_tags:
            markdown_lines.append(f"\n## 7. Thematic Vibrations\n- {', '.join(thematic_tags)}")

        markdown_lines.append("\n## 8. Guidance for CineMatch AI Assistant")
        markdown_lines.append("- ALWAYS personalize movie recommendations by referencing their specific persona and loved genres/directors.")
        markdown_lines.append("- Do NOT recommend movies that are already in their Favorites or Rated list unless they specifically ask for re-watches.")
        markdown_lines.append("- When user asks 'What is my taste?' or 'What kind of movies do I like?', directly use the verified facts in this document to explain their persona, top genres, and favorite titles.")

        taste_document_text = "\n".join(markdown_lines)

        return TasteProfileDocument(
            user_id=user_id,
            persona_title=persona_title,
            critic_style=critic_style,
            summary=summary,
            average_rating=avg_rating,
            total_ratings=total_ratings,
            total_favorites=len(favorite_movies),
            total_watchlist=len(watchlist_movies),
            top_genres=top_genres,
            avoid_genres=avoid_genres,
            favorite_directors=favorite_directors,
            favorite_actors=favorite_actors,
            top_rated_movies=high_rated_movies[:8],
            favorite_movies=favorite_movies[:8],
            watchlist_movies=watchlist_movies[:8],
            thematic_tags=thematic_tags,
            taste_document_text=taste_document_text
        )

    def get_taste_document(self, user_id: str, force_refresh: bool = False) -> TasteProfileDocument:
        """Retrieves user taste document from in-memory cache or builds fresh."""
        if not user_id:
            user_id = "anonymous"

        if not force_refresh and user_id in self._cache:
            entry = self._cache[user_id]
            if time.time() - entry["timestamp"] < self._cache_ttl:
                return entry["doc"]

        doc = self.build_taste_document(user_id)
        self._cache[user_id] = {
            "doc": doc,
            "timestamp": time.time()
        }
        return doc

    def invalidate(self, user_id: str):
        """Invalidates cached taste profile for a user."""
        if user_id in self._cache:
            del self._cache[user_id]

    def rank_hero_candidates(self, user_id: str, candidate_movies: List[Dict[str, Any]], limit: int = 8) -> List[Dict[str, Any]]:
        """
        Ranks candidate movies for the Hero Banner poster using the user's taste profile.
        Prioritizes:
        1. User top genre affinity match (weights based on % affinity)
        2. Favorite directors & actors match
        3. Thematic tag resonance
        4. High vote average / cinematic quality
        5. Penalizes avoid/disliked genres
        """
        if not candidate_movies:
            return []

        doc = self.get_taste_document(user_id) if user_id and user_id != "anonymous" else None
        
        # Build lookup weights for quick scoring
        genre_weights = {}
        if doc and doc.top_genres:
            for g in doc.top_genres:
                genre_weights[g["name"].lower()] = g["percentage"] / 100.0

        avoid_set = set(g.lower() for g in doc.avoid_genres) if doc else set()
        fav_directors = set(d.lower() for d in doc.favorite_directors) if doc else set()
        fav_actors = set(a.lower() for a in doc.favorite_actors) if doc else set()
        thematic_tags = [t.lower() for t in doc.thematic_tags] if doc else []

        scored = []
        seen_ids = set()

        for item in candidate_movies:
            mid = item.get("id") or item.get("movie_id")
            if not mid or mid in seen_ids:
                continue
            seen_ids.add(mid)
            
            m_meta = self._resolve_movie(int(mid))
            genres = [g.lower() for g in m_meta.get("genres", [])]
            director = (m_meta.get("director") or "").lower()
            cast = [c.lower() for c in m_meta.get("cast", [])]
            overview = (m_meta.get("overview") or "").lower()
            vote_avg = m_meta.get("vote_average", 0.0)

            # Avoid filter
            if any(ag in genres for ag in avoid_set):
                continue

            # Calculate taste score
            # 1. Genre affinity (0.0 to 1.0)
            genre_score = sum(genre_weights.get(g, 0.05) for g in genres)
            
            # 2. Director & Cast bonus
            director_bonus = 0.35 if (director and director in fav_directors) else 0.0
            cast_bonus = 0.15 * sum(1 for c in cast if c in fav_actors)

            # 3. Thematic bonus
            thematic_bonus = 0.15 if any(tag in overview for tag in thematic_tags) else 0.0

            # 4. Quality score (vote_average / 10)
            quality_score = min(vote_avg / 10.0, 1.0) if vote_avg > 0 else 0.65

            # 5. Base recommender score
            base_score = float(item.get("score") or 0.7)

            total_score = (
                (genre_score * 0.40) +
                (director_bonus + cast_bonus) +
                (thematic_bonus * 0.15) +
                (quality_score * 0.20) +
                (base_score * 0.25)
            )

            # Build taste reason
            reasons = list(item.get("reasons") or [])
            matched_genres = [g.capitalize() for g in genres if g in genre_weights]
            if matched_genres:
                reasons.insert(0, f"Top match for your {matched_genres[0]} taste")
            elif doc and doc.persona_title:
                reasons.insert(0, f"Matched to your {doc.persona_title} profile")

            persona_badge = f"Matched to your {doc.persona_title} taste" if (doc and doc.persona_title) else "Curated for you"

            scored.append({
                "id": int(mid),
                "score": round(total_score, 3),
                "taste_score": round(total_score, 3),
                "reasons": reasons,
                "persona_badge": persona_badge,
                "title": m_meta.get("title", item.get("title", ""))
            })

        # Sort descending by taste score
        scored.sort(key=lambda x: x["taste_score"], reverse=True)
        return scored[:limit]

detail_engine = DetailEngine()
