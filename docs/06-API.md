# CineMatch API Documentation

## Base URL
In production: `https://api.cinematch.com/api`
Local development: `http://localhost:8000/api`

---

## 1. AI Assistant

### Chat with AI Picks
`POST /ai/chat`

Generates conversational recommendations based on natural language intent.

**Rate Limit**: 20 requests per minute per IP.

#### Request Body
```json
{
  "conversation_id": "uuid-v4",
  "user_id": "uuid-v4",
  "message": "Show me a sci-fi movie under 2 hours that isn't depressing."
}
```

#### Response (200 OK)
```json
{
  "reply": "I have found the perfect match for you! Here are a few fast-paced, exciting sci-fi movies that are guaranteed to keep you entertained without dragging you down.",
  "movies": [
    {
      "movie": {
        "id": 123,
        "title": "Guardians of the Galaxy",
        "poster_path": "/poster.jpg"
      },
      "score": 0.95,
      "match_percentage": 95,
      "explanation": "This fits your request perfectly. It is 1 hour and 55 minutes, full of upbeat action, and definitely a classic sci-fi."
    }
  ]
}
```

---

## 2. Recommendations

### Get Personalized Recommendations
`POST /recommendations`

Fetches standard recommendations from the Ranking Engine based on the user's taste profile.

**Rate Limit**: 60 requests per minute per IP.

#### Request Body
```json
{
  "user_id": "uuid-v4",
  "limit": 20,
  "exclude_seen": true
}
```

#### Response (200 OK)
```json
{
  "recommendations": [
    {
      "movie": {
        "id": 27205,
        "title": "Inception"
      },
      "score": 0.98,
      "match_percentage": 98,
      "explanation": "Because you liked The Matrix."
    }
  ]
}
```

### Submit Feedback
`POST /recommendations/feedback`

Records explicit feedback (Like/Dislike) on a recommendation to improve future ranking.

#### Request Body
```json
{
  "user_id": "uuid-v4",
  "movie_id": 123,
  "feedback_type": "LIKE" // or "DISLIKE"
}
```

### Submit Tracking Event
`POST /recommendations/events`

Records implicit user behaviors for the analytics funnel.

#### Request Body
```json
{
  "user_id": "uuid-v4",
  "event_type": "clicked", // generated | shown | clicked | watchlisted | favorited | rated
  "movie_id": 123,
  "score": 0.95
}
```

---

## 3. Analytics (Admin)

### Get Analytics Dashboard Data
`GET /recommendations/analytics`

Retrieves system health, cache statistics, and funnel conversions.

**Headers**
- `x-admin-key`: `<ADMIN_SECRET_KEY>`

#### Response (200 OK)
```json
{
  "cache_stats": {
    "hits": 150,
    "misses": 23
  },
  "funnel": {
    "generated": 1500,
    "shown": 1200,
    "clicked": 400
  }
}
```

---

## Global Errors
All endpoints will return a standardized error object on failure:

```json
{
  "success": false,
  "message": "Human readable error message",
  "code": "ERROR_CODE"
}
```
**Common Error Codes:**
- `VALIDATION_ERROR`: 422 Unprocessable Entity
- `RECOMMENDATION_ERROR`: 500 Internal Server Error
- `AI_ERROR`: 502 Bad Gateway (Upstream LLM failed)
- `TMDB_ERROR`: 502 Bad Gateway (Upstream TMDB failed)
- `RATE_LIMIT_EXCEEDED`: 429 Too Many Requests
