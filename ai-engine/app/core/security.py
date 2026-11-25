import hmac
import os
import re
import time
from typing import Optional, Dict, Tuple
from fastapi import Header, HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware

# Short-lived in-memory JWT verification cache: token -> (user_id, expires_at)
_token_cache: Dict[str, Tuple[str, float]] = {}
_TOKEN_CACHE_TTL = 60.0


def verify_admin(x_admin_key: Optional[str] = Header(None)) -> bool:
    """Constant-time verification of the server-side admin key."""
    expected_key = os.environ.get("ADMIN_SECRET_KEY")
    if not expected_key or not x_admin_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not hmac.compare_digest(x_admin_key.encode("utf-8"), expected_key.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def _get_verified_user_id_from_bearer(authorization: Optional[str]) -> Optional[str]:
    """Verifies a Supabase Bearer JWT and returns the authenticated user's UUID."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:].strip()
    if not token:
        return None

    now = time.time()
    cached = _token_cache.get(token)
    if cached and cached[1] > now:
        return cached[0]

    try:
        from supabase import create_client
        from app.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

        api_key = SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY
        if not SUPABASE_URL or not api_key:
            return None

        sb = create_client(SUPABASE_URL, api_key)
        res = sb.auth.get_user(token)
        if res and res.user and res.user.id:
            uid = str(res.user.id)
            _token_cache[token] = (uid, now + _TOKEN_CACHE_TTL)
            # Prune cache if it grows too large
            if len(_token_cache) > 1000:
                expired = [k for k, (_, exp) in _token_cache.items() if exp <= now]
                for k in expired:
                    _token_cache.pop(k, None)
            return uid
    except Exception:
        return None

    return None


def verify_user_ownership(user_id: str, authorization: Optional[str] = Header(None)) -> str:
    """
    Requires a valid Supabase Bearer JWT whose subject matches the requested user_id.
    Prevents IDOR (changing user_id in URL/body to access or mutate another user's data).
    """
    verified_uid = _get_verified_user_id_from_bearer(authorization)
    if not verified_uid:
        raise HTTPException(status_code=401, detail="Authentication required")
    if verified_uid != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: cannot access another user's resources")
    return verified_uid


def sanitize_prompt_input(text: str, max_len: int = 1000) -> str:
    """
    Sanitizes untrusted user text before inserting it into LLM prompts:
    - Strips control characters
    - Neutralizes XML delimiter escape attempts
    - Enforces strict character length bounds
    """
    if not text:
        return ""
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    cleaned = cleaned.replace("<user_query>", "[user_query]").replace("</user_query>", "[/user_query]")
    return cleaned.strip()[:max_len]


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Applies defensive HTTP security headers to all backend responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
