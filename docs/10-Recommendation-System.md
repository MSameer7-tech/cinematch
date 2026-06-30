# Recommendation System

## Goal

Build an AI-powered recommendation engine that learns from each user's behavior rather than relying solely on TMDB popularity.

---

## Data Sources

- Watchlists
- Favorites
- Ratings
- Recently Viewed
- User Preferences

---

## Taste Profile

The backend combines all user activity into a temporary profile.

Example:

- Favorite genres
- Highly rated movies
- Recently watched movies
- Preferred language
- Adult content preference

---

## AI Input

OpenAI receives:

- Favorite movies
- Watchlist
- Ratings
- Genres
- Languages
- Recently viewed movies

---

## AI Output

The AI returns:

- Recommended TMDB Movie IDs
- Explanation for each recommendation

Example:

**Interstellar**

*Reason:* Recommended because you highly rated Arrival and Inception.

---

## Movie Metadata

The AI never stores movie titles.

TMDB provides:

- Poster
- Title
- Genres
- Overview
- Runtime
- Cast

Only TMDB IDs are used internally.

---

## Future Improvements

- `recommendation_cache` table
- Recommendation feedback
- Like/Dislike recommendations
- Similar user recommendations
- Trending among users
