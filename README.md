<div align="center">
  <img src="https://via.placeholder.com/150x150/4f46e5/ffffff?text=CineMatch" alt="CineMatch Logo" width="120" />
  <h1>CineMatch</h1>
  <p><strong>AI-Powered Conversational Movie Recommendations</strong></p>

  [![CI Pipeline](https://github.com/yourusername/CineMatch/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/CineMatch/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg)](https://www.python.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)

</div>

---

## 🎬 Overview
CineMatch is a production-ready, full-stack movie recommendation platform. It combines a deterministic, high-performance TF-IDF ML ranking engine with a natural language AI assistant powered by Groq. 

Instead of relying on LLMs to hallucinate movie titles, CineMatch uses LLMs strictly as NLP routers—extracting user intent, applying metadata constraints to the deterministic Python engine, and then explaining the mathematically ranked results back to the user in a conversational UI.

## ✨ Features
- **Deterministic Recommendations**: TF-IDF similarity scoring across 4,600+ movies to find hidden gems based on your favorites.
- **Conversational AI Picks**: Ask for "A fast-paced sci-fi under 2 hours" and receive perfectly constrained, mathematically ranked suggestions.
- **Explainable AI**: The engine explains *why* a movie was chosen (e.g., "Because you liked The Matrix and asked for action.")
- **Recursive Memory**: An intelligent sliding-window LLM context buffer for continuous, context-aware conversations.
- **Interactive UI**: Glassmorphism design, real-time analytics dashboards, and smooth recommendation carousels.

## 🏗️ Architecture

![Architecture](docs/architecture.drawio)

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, Python 3.11, Pydantic, SlowAPI.
- **Database & Auth**: Cloud Supabase (PostgreSQL), Row Level Security (RLS).
- **ML / AI**: Scikit-Learn (TF-IDF), Pandas, Groq Python SDK (Llama 3.1).

*For deep dives into the system design, please read the [Documentation Suite](./docs).*

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/CineMatch.git
cd CineMatch
```

### 2. Environment Variables
Copy the `.env.example` file and configure your API keys.
```bash
cp .env.example .env
```
*(You will need a Supabase project and a Groq API key).*

### 3. Run with Docker Compose
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Frontend will be live at `http://localhost:5173`
- Backend API will be live at `http://localhost:8000/api`

## 📚 Documentation
For interviewers, recruiters, or developers, please refer to the extensive documentation:
1. [Architecture Overview](docs/01-Architecture.md)
2. [System Design Patterns](docs/02-System-Design.md)
3. [Database Schema](docs/03-Database.md)
4. [Recommendation Engine Math](docs/04-Recommendation-Engine.md)
5. [AI Picks Pipeline](docs/05-AI-Picks.md)
6. [API Documentation](docs/06-API.md)
7. [Deployment Guide](docs/07-Deployment.md)
8. [Future Roadmap](docs/08-Future-Roadmap.md)

## 🤝 Contributing
Please see our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
