from fastapi import FastAPI, HTTPException, Header, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender.recommendation_service import RecommendationService
from app.services.feedback_service import feedback_service
from app.services.event_service import event_service
from app.cache.recommendation_cache import recommendation_cache
from app.ai.services.conversation_service import conversation_service
from app.core.errors import register_error_handlers
from app.core.security import verify_admin, verify_user_ownership, SecurityHeadersMiddleware

# Content Orchestrator Imports (Sprint 9)
from app.content.models.homepage_models import HomepageContext
from app.content.orchestrator import HomepageOrchestrator
from app.content.repositories.user_repository import UserRepository
from app.content.repositories.history_repository import HistoryRepository
from datetime import datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(title="CineMatch Recommendation Engine")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

register_error_handlers(app)

# Explicit CORS origins (avoid wildcard '*' with allow_credentials=True)
_allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
if os.environ.get("FRONTEND_URL"):
    for origin in os.environ["FRONTEND_URL"].split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned:
            _allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Admin-Key"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

print("Initializing Recommendation Service Models...")
recommender = RecommendationService()

class APIRecommendationRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    limit: int = Field(default=20, ge=1, le=50)
    exclude_seen: bool = True

@app.post("/api/recommendations")
@limiter.limit("60/minute")
async def get_recommendations(req: APIRecommendationRequest, request: Request):
    try:
        from app.models.recommendation_request import RecommendationRequest as RecReq
        rec_request = RecReq(user_id=req.user_id, limit=req.limit, exclude_seen=req.exclude_seen)
        results = recommender.get_recommendations(rec_request)
        return {"recommendations": results}
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

class FeedbackRequest(BaseModel):
    user_id: str
    movie_id: int
    feedback_type: str # 'LIKE' or 'DISLIKE'

@app.post("/api/recommendations/feedback")
@limiter.limit("100/minute")
async def submit_feedback(req: FeedbackRequest, request: Request):
    try:
        feedback_service.submit_feedback(req.user_id, req.movie_id, req.feedback_type)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EventRequest(BaseModel):
    user_id: str
    event_type: str
    movie_id: Optional[int] = None
    score: Optional[float] = None
    section_type: Optional[str] = None # Sprint 9 detailed analytics
    position: Optional[int] = None

@app.post("/api/recommendations/events")
@limiter.limit("200/minute")
async def submit_event(req: EventRequest, request: Request):
    try:
        # Standard tracking events
        # If section_type is specified, we store details inside standard event_type
        # as event_type:section_type to keep analytics structured without DB changes.
        evt_type = req.event_type
        if req.section_type:
            evt_type = f"{req.event_type}:{req.section_type}"
            
        if req.event_type == "generated":
            event_service.track_generated(req.user_id)
        elif req.event_type == "shown":
            if req.movie_id is not None:
                # Pass req.score or default 0.0
                score_val = req.score if req.score is not None else 0.0
                event_service.track_shown(req.user_id, req.movie_id, score_val)
                
                # Also log to recommendation_history for cooldown logic (Phase 4)
                try:
                    hist_repo = HistoryRepository()
                    hist_repo.record_shown_recommendations(req.user_id, [req.movie_id], req.section_type or "general")
                except Exception as ex:
                    print(f"Error logging recommendation history: {ex}")
        elif req.event_type == "clicked":
            event_service.track_clicked(req.user_id, req.movie_id, req.score)
        elif req.event_type == "watchlisted":
            event_service.track_watchlisted(req.user_id, req.movie_id, req.score)
        elif req.event_type == "favorited":
            event_service.track_favorited(req.user_id, req.movie_id, req.score)
        elif req.event_type == "rated":
            event_service.track_rated(req.user_id, req.movie_id, req.score)
        elif req.event_type in ["typed", "suggestion_opened", "suggestion_clicked", "submitted", "scrolled", "shared"] or req.event_type.startswith("search_"):
            # Accept and print/log search analytics events (Phase 8)
            print(f"Search Analytics Logged: {req.user_id} - {req.event_type} - {req.movie_id} - {req.score}")
        else:
            raise HTTPException(status_code=400, detail="Invalid event type")
            
        # Log auxiliary metrics using composite event types if section_type is provided
        if req.section_type and req.event_type != "shown":
            try:
                # We can also call track_event directly using the modified type
                # (e.g. click position or rates)
                event_service._track_event(req.user_id, evt_type, req.movie_id, req.score)
            except Exception as ex:
                print(f"Error logging auxiliary CTR event: {ex}")
                
        return {"status": "success"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/analytics")
@limiter.limit("30/minute")
async def get_analytics(request: Request, authorized: bool = Depends(verify_admin)):
    try:
        # In a real scenario, this would query Supabase for aggregates.
        # For Phase 6, we're scaffolding the endpoint and returning dummy data or cache stats
        return {
            "cache_stats": recommendation_cache.stats(),
            "funnel": {
                "generated": 1500,
                "shown": 1200,
                "clicked": 400,
                "watchlisted": 85,
                "rated": 30,
                "liked": 120
            },
            "score_distribution": {
                "90-100": 45,
                "80-90": 130,
                "70-80": 210,
                "below_70": 15
            },
            "top_genres": ["Sci-Fi", "Drama", "Crime"],
            "worst_genres": ["Horror", "Documentary"]
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/recommendations/cache/{user_id}")
@limiter.limit("20/minute")
async def delete_user_cache(
    user_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    recommendation_cache.invalidate(user_id)
    return {"status": "success"}

# Homepage Content Orchestrator Instances
user_repo = UserRepository()
hist_repo = HistoryRepository()
orchestrator = HomepageOrchestrator()

@app.get("/api/homepage")
async def get_homepage(
    user_id: str,
    timezone: Optional[str] = "UTC",
    locale: Optional[str] = "en-US",
    experiment_group: Optional[str] = None,
    region: str = "all",
    include_mature: bool = True
):
    try:
        # 1. Fetch user data from repositories
        favorites = user_repo.get_user_favorites(user_id)
        watchlist = user_repo.get_user_watchlist(user_id)
        recently_viewed = hist_repo.get_recently_viewed(user_id, limit=20)
        
        # Load user taste profile to learn favorite genres dynamically
        from app.recommender.profile_builder import ProfileBuilder
        pb = ProfileBuilder()
        profile = pb.build_profile(user_id)
        
        favorite_genres = profile.favorite_genres
        preferences = user_repo.get_user_preferences(user_id)
        
        # Load recent recommendation history for cooldown logic
        from app.content.config import COOLDOWN_DAYS
        recommendation_history = hist_repo.get_recommendation_history(user_id, days_limit=COOLDOWN_DAYS)
        
        # 2. Compute a stable daily SHA-256 rotation seed (Phase 5)
        import hashlib
        today = datetime.utcnow().date().isoformat()
        hash_input = f"{user_id}{today}"
        rotation_seed = int(hashlib.sha256(hash_input.encode('utf-8')).hexdigest(), 16) % 200
        
        # Fetch user's taste document to guide Hero recommendations and section sorting
        from app.services.detail_engine import detail_engine
        taste_doc = None
        try:
            if user_id and user_id not in ["anonymous", "guest"]:
                taste_doc = detail_engine.get_taste_document(user_id)
        except Exception as te:
            print(f"DetailEngine homepage load notice: {te}")

        # 3. Create context
        context = HomepageContext(
            user_id=user_id,
            today=today,
            rotation_seed=rotation_seed,
            timezone=timezone,
            locale=locale,
            favorite_genres=favorite_genres,
            preferences=preferences,
            favorites=favorites,
            watchlist=watchlist,
            recently_viewed=recently_viewed,
            highly_rated=profile.highly_rated_movie_ids,
            recommendation_history=recommendation_history,
            taste_profile=taste_doc.model_dump() if taste_doc else None
        )
        
        # 4. Generate homepage
        homepage_response = await orchestrator.build_homepage(context, experiment_group=experiment_group)

        # Apply Mature Content filter if disabled
        if not include_mature:
            if getattr(homepage_response, "hero_movies", None):
                homepage_response.hero_movies = [m for m in homepage_response.hero_movies if not getattr(m, "adult", False)]
            for s in homepage_response.sections:
                s.movies = [m for m in s.movies if not getattr(m, "adult", False)]
            homepage_response.sections = [s for s in homepage_response.sections if s.movies]

        # Apply Primary Cinema Focus region preference
        if region == "bollywood":
            bolly_sections = [s for s in homepage_response.sections if s.strategy == "bollywood" or "bollywood" in s.id.lower()]
            other_sections = [s for s in homepage_response.sections if s not in bolly_sections]
            homepage_response.sections = bolly_sections + other_sections
            if bolly_sections and bolly_sections[0].movies:
                homepage_response.hero_movies = bolly_sections[0].movies[:8]
                homepage_response.hero = bolly_sections[0].movies[0]
        elif region == "international":
            homepage_response.sections = [
                s for s in homepage_response.sections
                if s.strategy != "bollywood" and "bollywood" not in s.id.lower()
            ]

        return homepage_response
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Fallback to cold-start homepage if anything fails
        try:
            today = datetime.utcnow().date().isoformat()
            fallback_context = HomepageContext(
                user_id=user_id or "anonymous",
                today=today,
                rotation_seed=0,
                timezone=timezone or "UTC",
                locale=locale or "en-US",
                favorite_genres=[],
                preferences={},
                favorites=[],
                watchlist=[],
                recently_viewed=[],
                highly_rated=[],
                recommendation_history=[]
            )
            return await orchestrator.build_homepage(fallback_context, experiment_group=experiment_group)
        except Exception as fallback_err:
            raise HTTPException(status_code=500, detail=str(fallback_err))

@app.get("/api/homepage/sections/{section_id}")
async def get_homepage_section(
    section_id: str,
    user_id: Optional[str] = "anonymous",
    page: int = Query(1, ge=1, le=500),
    page_size: int = Query(20, ge=1, le=50),
    timezone: Optional[str] = "UTC",
    locale: Optional[str] = "en-US",
    experiment_group: Optional[str] = None
):
    try:
        # 1. Fetch user data (similar to main homepage endpoint)
        favorites = user_repo.get_user_favorites(user_id)
        watchlist = user_repo.get_user_watchlist(user_id)
        recently_viewed = hist_repo.get_recently_viewed(user_id, limit=20)
        
        from app.recommender.profile_builder import ProfileBuilder
        pb = ProfileBuilder()
        profile = pb.build_profile(user_id)
        
        favorite_genres = profile.favorite_genres
        preferences = user_repo.get_user_preferences(user_id)
        
        from app.content.config import COOLDOWN_DAYS
        recommendation_history = hist_repo.get_recommendation_history(user_id, days_limit=COOLDOWN_DAYS)
        
        import hashlib
        today = datetime.utcnow().date().isoformat()
        hash_input = f"{user_id}{today}"
        rotation_seed = int(hashlib.sha256(hash_input.encode('utf-8')).hexdigest(), 16) % 200
        
        context = HomepageContext(
            user_id=user_id,
            today=today,
            rotation_seed=rotation_seed,
            timezone=timezone,
            locale=locale,
            favorite_genres=favorite_genres,
            preferences=preferences,
            favorites=favorites,
            watchlist=watchlist,
            recently_viewed=recently_viewed,
            highly_rated=profile.highly_rated_movie_ids,
            recommendation_history=recommendation_history
        )
        
        # 2. Find strategy and generate the SectionPage response
        strategy = orchestrator.strategies.get(section_id)
        if not strategy:
            raise HTTPException(status_code=404, detail=f"Strategy '{section_id}' not found.")
            
        section_page = await strategy.generate(context, page=page, page_size=page_size)
        return section_page
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/bootstrap")
async def get_search_bootstrap():
    try:
        from app.search.services.search_service import search_service
        return search_service.get_bootstrap_data()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from app.search.models.search_models import AISearchRequest

@app.post("/api/search/ai")
@limiter.limit("15/minute")
async def post_search_ai(req: AISearchRequest, request: Request):
    try:
        from app.search.services.search_service import search_service
        return await search_service.parse_ai_search(req.query[:300])
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

class AIChatRequest(BaseModel):
    conversation_id: str = Field(..., min_length=1, max_length=128)
    user_id: str = Field(..., min_length=1, max_length=128)
    message: str = Field(..., min_length=1, max_length=1000)

class SaveConversationRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    id: str = Field(..., min_length=1, max_length=128)
    title: Optional[str] = Field(default=None, max_length=100)
    messages: list = Field(default_factory=list, max_length=200)

class RenameConversationRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    title: str = Field(..., min_length=1, max_length=100)

@app.post("/api/ai/chat")
@limiter.limit("20/minute")
async def chat_with_ai(
    req: AIChatRequest,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(req.user_id, authorization)
    try:
        response = conversation_service.chat(
            conversation_id=req.conversation_id,
            user_id=req.user_id,
            message=req.message
        )
        return response
    except HTTPException:
        raise
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/ai/conversations")
@limiter.limit("60/minute")
async def list_ai_conversations(
    request: Request,
    user_id: str = Query(..., min_length=1, max_length=128),
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    try:
        from app.ai.services.conversation_store import conversation_store
        return conversation_store.list_conversations(user_id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/ai/conversations/{conversation_id}")
@limiter.limit("60/minute")
async def get_ai_conversation(
    conversation_id: str,
    request: Request,
    user_id: str = Query(..., min_length=1, max_length=128),
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    try:
        from app.ai.services.conversation_store import conversation_store
        conv = conversation_store.get_conversation(user_id, conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/ai/conversations")
@limiter.limit("60/minute")
async def save_ai_conversation(
    req: SaveConversationRequest,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(req.user_id, authorization)
    try:
        from app.ai.services.conversation_store import conversation_store
        conv_data = {
            "id": req.id,
            "title": req.title,
            "messages": req.messages
        }
        return conversation_store.save_conversation(req.user_id, conv_data)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.patch("/api/ai/conversations/{conversation_id}")
@limiter.limit("30/minute")
async def rename_ai_conversation(
    conversation_id: str,
    req: RenameConversationRequest,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(req.user_id, authorization)
    try:
        from app.ai.services.conversation_store import conversation_store
        updated = conversation_store.rename_conversation(req.user_id, conversation_id, req.title)
        if not updated:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return updated
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/ai/conversations/{conversation_id}")
@limiter.limit("30/minute")
async def delete_ai_conversation(
    conversation_id: str,
    request: Request,
    user_id: str = Query(..., min_length=1, max_length=128),
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    try:
        from app.ai.services.conversation_store import conversation_store
        deleted = conversation_store.delete_conversation(user_id, conversation_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"status": "success", "id": conversation_id}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/ai/conversations")
@limiter.limit("10/minute")
async def clear_ai_conversations(
    request: Request,
    user_id: str = Query(..., min_length=1, max_length=128),
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    try:
        from app.ai.services.conversation_store import conversation_store
        conversation_store.clear_all(user_id)
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/users/{user_id}/taste-profile")
@limiter.limit("30/minute")
async def get_user_taste_profile(
    user_id: str,
    request: Request,
    refresh: bool = False,
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    try:
        from app.services.detail_engine import detail_engine
        doc = detail_engine.get_taste_document(user_id, force_refresh=refresh)
        return doc.model_dump()
    except HTTPException:
        raise
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/users/{user_id}/taste-profile/refresh")
@limiter.limit("10/minute")
async def refresh_user_taste_profile(
    user_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    verify_user_ownership(user_id, authorization)
    try:
        from app.services.detail_engine import detail_engine
        doc = detail_engine.get_taste_document(user_id, force_refresh=True)
        return doc.model_dump()
    except HTTPException:
        raise
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

class MovieBatchRequest(BaseModel):
    movie_ids: list[int] = Field(..., max_length=250)

# -------------------------------------------------------------
# TMDB Clearlogo / Formatted Movie Title Fetcher & Cache
# -------------------------------------------------------------
import urllib3.util.connection as urllib_conn
import requests
import json

TMDB_DIRECT_IP = "3.175.86.37"
_orig_create_conn = urllib_conn.create_connection

def _tmdb_patched_conn(address, *args, **kwargs):
    host, port = address
    if host == "api.themoviedb.org":
        host = TMDB_DIRECT_IP
    return _orig_create_conn((host, port), *args, **kwargs)

urllib_conn.create_connection = _tmdb_patched_conn

LOGO_CACHE_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "logo_cache.json")
logo_cache: dict = {}
if os.path.exists(LOGO_CACHE_FILE):
    try:
        with open(LOGO_CACHE_FILE, "r", encoding="utf-8") as f:
            logo_cache = json.load(f)
    except Exception:
        logo_cache = {}

def save_logo_cache():
    try:
        with open(LOGO_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(logo_cache, f)
    except Exception:
        pass

def fetch_tmdb_logo(movie_id: int) -> dict:
    str_id = str(movie_id)
    if str_id in logo_cache:
        return logo_cache[str_id]
    
    api_key = os.getenv("TMDB_API_KEY", "")
    if not api_key:
        return {"logo_path": None}
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/images?api_key={api_key}&include_image_language=en,null"
    try:
        resp = requests.get(url, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            logos = data.get("logos", [])
            if logos:
                en_logos = [l for l in logos if l.get("iso_639_1") == "en" and l.get("file_path")]
                best_logo = en_logos[0] if en_logos else logos[0]
                result = {
                    "logo_path": best_logo.get("file_path"),
                    "aspect_ratio": best_logo.get("aspect_ratio"),
                    "width": best_logo.get("width"),
                    "height": best_logo.get("height"),
                }
                logo_cache[str_id] = result
                save_logo_cache()
                return result
    except Exception as e:
        print(f"Error fetching TMDB logo for {movie_id}: {e}")
    
    logo_cache[str_id] = {"logo_path": None}
    save_logo_cache()
    return logo_cache[str_id]

@app.get("/api/movies/trending")
def get_movies_trending(page: int = Query(1, ge=1)):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.get_trending(page=page)

@app.get("/api/movies/now_playing")
@app.get("/api/movies/new_releases")
def get_movies_new_releases(page: int = Query(1, ge=1)):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.get_new_releases(page=page)

@app.get("/api/movies/discover")
@limiter.limit("60/minute")
def discover_movies_endpoint(
    request: Request,
    page: int = Query(1, ge=1, le=500),
    genre_id: Optional[int] = Query(None),
    category: str = Query("popular"),
    media_type: str = Query("movie"),
    region: str = Query("all"),
    include_mature: bool = Query(True)
):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.discover_movies(
        page=page,
        genre_id=genre_id,
        category=category,
        media_type=media_type,
        region=region,
        include_mature=include_mature
    )

@app.get("/api/movies/popular")
def get_movies_popular(page: int = Query(1, ge=1, le=500)):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.get_popular(page=page)

@app.get("/api/movies/top_rated")
def get_movies_top_rated(page: int = Query(1, ge=1, le=500)):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.get_top_rated(page=page)

@app.get("/api/movies/search")
@limiter.limit("60/minute")
def search_movies(
    request: Request,
    query: str = Query(..., min_length=1, max_length=200),
    page: int = Query(1, ge=1, le=500)
):
    from app.content.services.tmdb_live_service import tmdb_live_service
    data = tmdb_live_service._fetch_endpoint("search/movie", {"query": query, "page": page})
    if data and "results" in data:
        released = tmdb_live_service._filter_released_movies(data["results"])
        return {
            "page": page,
            "results": released,
            "total_pages": data.get("total_pages", 1),
            "total_results": len(released)
        }
    return {"page": page, "results": [], "total_pages": 0, "total_results": 0}

@app.get("/api/movies/{movie_id}/logo")
def get_movie_logo(movie_id: int):
    return fetch_tmdb_logo(movie_id)

@app.get("/api/movies/{movie_id}/videos")
def get_movie_videos_endpoint(movie_id: int, title: Optional[str] = None):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.get_movie_videos(movie_id, title=title)

@app.get("/api/movies/{movie_id}")
def get_movie_detail(movie_id: int):
    from app.content.services.tmdb_live_service import tmdb_live_service
    detail = tmdb_live_service.get_movie_detail(movie_id)
    if detail:
        cached_logo = logo_cache.get(str(movie_id))
        if cached_logo and cached_logo.get("logo_path"):
            detail["logo_path"] = cached_logo["logo_path"]
        return detail

    # Fallback to local raw file if exists
    raw_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw", f"movie_{movie_id}.json")
    if os.path.exists(raw_path):
        with open(raw_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            cached_logo = logo_cache.get(str(movie_id))
            if cached_logo and cached_logo.get("logo_path"):
                data["logo_path"] = cached_logo["logo_path"]
            return data

    raise HTTPException(status_code=404, detail="Movie not found")

@app.get("/api/movies/{movie_id}/credits")
def get_movie_credits_endpoint(movie_id: int):
    from app.content.services.tmdb_live_service import tmdb_live_service
    return tmdb_live_service.get_movie_credits(movie_id)

@app.post("/api/movies/batch")
def get_movies_batch(req: MovieBatchRequest):
    from concurrent.futures import ThreadPoolExecutor
    from app.content.services.tmdb_live_service import tmdb_live_service

    raw_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
    results = {}
    missing_ids = []

    for mid in req.movie_ids:
        raw_path = os.path.join(raw_dir, f"movie_{mid}.json")
        data = None
        if os.path.exists(raw_path):
            try:
                with open(raw_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                pass
        if data:
            results[mid] = data
        else:
            missing_ids.append(mid)

    if missing_ids:
        def _fetch_one(mid: int):
            return mid, tmdb_live_service.get_movie_detail(mid)

        with ThreadPoolExecutor(max_workers=10) as pool:
            for mid, data in pool.map(_fetch_one, missing_ids):
                if data:
                    results[mid] = data

    formatted = {}
    for mid, data in results.items():
        # Copy before stripping huge credits/keywords from batch responses
        item = dict(data)
        item.pop("credits", None)
        item.pop("keywords", None)
        cached_logo = logo_cache.get(str(mid))
        if cached_logo and cached_logo.get("logo_path"):
            item["logo_path"] = cached_logo["logo_path"]
        formatted[str(mid)] = item

    return formatted

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
