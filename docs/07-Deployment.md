# 7. Deployment Guide

CineMatch is containerized via Docker and can be deployed to any major cloud provider.

## Prerequisites
- A remote Supabase project.
- A Groq API Key.
- Docker & Docker Compose.

## 1. Environment Configuration

Create an `.env` file in the root based on `.env.example`:

```env
# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://api.yourdomain.com

# Backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-key
AI_PROVIDER=groq
DEFAULT_MODEL=llama-3.1-8b-instant
ADMIN_SECRET_KEY=your-secure-admin-key
```

## 2. Docker Compose Deployment

Run the production compose file:

```bash
docker compose up -d --build
```

This will:
1. Build the multi-stage Vite/React application and serve it via Nginx on port 80.
2. Build the FastAPI Python application and serve it via Uvicorn on port 8000.

## 3. Reverse Proxy (Optional but Recommended)
In a production setting, place a reverse proxy (e.g., Caddy, Traefik, Nginx) in front of the docker containers to handle SSL termination.

- Map `cinematch.com` to `localhost:80`
- Map `api.cinematch.com` to `localhost:8000`
