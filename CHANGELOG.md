# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - Release Candidate

### Added
- **AI Picks Assistant**: Groq-powered natural language movie recommendations.
- **Recommendation Engine**: Custom TF-IDF similarity matrix based on TMDB dataset.
- **Frontend App**: React/Vite SPA with Tailwind CSS glassmorphism UI.
- **Authentication**: Supabase Auth integration.
- **Analytics Dashboard**: Real-time cache stats and funnel metrics.
- **Dockerization**: Complete `docker-compose` setup for dev and prod.
- **CI/CD**: GitHub Actions pipeline for testing, linting, and Docker validation.
- **Comprehensive Docs**: 8-part markdown documentation suite.
- **Rate Limiting**: `slowapi` integration to protect LLM endpoints.
- **Centralized Error Handling**: Standardized JSON responses for all FastAPI exceptions.
