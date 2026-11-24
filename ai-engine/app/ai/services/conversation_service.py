from typing import Dict, Any, Optional
import json
import uuid
from app.ai.clients.llm_client import llm_client
from app.ai.prompts.system_prompt import SYSTEM_PROMPT
from app.ai.prompts.intent_prompt import INTENT_PROMPT
from app.ai.prompts.explanation_prompt import EXPLANATION_PROMPT
from app.ai.prompts.summary_prompt import SUMMARY_PROMPT
from app.ai.utils.json_parser import JSONParser
from app.ai.schemas.intent_schema import IntentSchema
from app.ai.utils.request_builder import RecommendationRequestBuilder
from app.recommender.recommendation_service import RecommendationService
from app.services.detail_engine import detail_engine

# Memory Cache (conversation_id -> list of messages)
conversation_memory: Dict[str, list] = {}

class ConversationService:
    def __init__(self):
        self.recommendation_service = RecommendationService()

    def _build_system_prompt(self, taste_doc_text: str = "") -> str:
        prompt = SYSTEM_PROMPT
        if taste_doc_text:
            prompt += f"\n\n--- USER TASTE PROFILE DOCUMENT ---\n{taste_doc_text}\n-----------------------------------"
        return prompt

    def get_or_create_memory(self, conversation_id: str, taste_doc_text: str = "") -> list:
        system_content = self._build_system_prompt(taste_doc_text)
        if conversation_id not in conversation_memory:
            conversation_memory[conversation_id] = [{"role": "system", "content": system_content}]
        else:
            # Refresh system prompt with the latest user taste profile
            conversation_memory[conversation_id][0] = {"role": "system", "content": system_content}
        return conversation_memory[conversation_id]

    def chat(self, conversation_id: str, user_id: str, message: str) -> Dict[str, Any]:
        # 0. Fetch or compute User Taste Profile Document via DetailEngine
        taste_doc = None
        taste_doc_text = ""
        try:
            if user_id and user_id != "guest":
                taste_doc = detail_engine.get_taste_document(user_id)
                if taste_doc:
                    taste_doc_text = taste_doc.taste_document_text
        except Exception as e:
            print(f"[ConversationService] Error fetching taste doc: {e}")

        memory = self.get_or_create_memory(conversation_id, taste_doc_text=taste_doc_text)
        
        # 1. Intent Parsing
        intent_messages = [
            {"role": "system", "content": INTENT_PROMPT},
            {"role": "user", "content": message}
        ]
        
        raw_intent = llm_client.chat(messages=intent_messages, json_mode=True, temperature=0.1)
        intent_dict = JSONParser.parse_llm_json(raw_intent)
        intent_data = IntentSchema(**intent_dict)
        
        # Handle irrelevant intent
        if intent_data.intent == "irrelevant":
            memory.append({"role": "user", "content": message})
            reply = "I'm CineMatch AI! I can help you find movies based on your mood, analyze your taste profile, or suggest films based on what you love. What are you in the mood for?"
            memory.append({"role": "assistant", "content": reply})
            return {
                "reply": reply,
                "movies": [],
                "taste_profile": taste_doc.model_dump() if taste_doc else None
            }
            
        # 2. Translate to RecommendationRequest using taste profile signals
        req = RecommendationRequestBuilder.build(user_id, intent_data, taste_doc=taste_doc)
        
        # 3. Call Recommendation Engine
        recommendations = self.recommendation_service.get_recommendations(req)
        
        # If no recommendations found
        if not recommendations:
            if intent_data.intent == "taste_profile" and taste_doc:
                # Answer the user's taste query directly from their profile document
                taste_messages = memory.copy()
                taste_messages.append({
                    "role": "user",
                    "content": f"User question: '{message}'. Use your USER TASTE PROFILE DOCUMENT to provide an insightful, engaging breakdown of their taste profile."
                })
                reply = llm_client.chat(messages=taste_messages, temperature=0.7)
                memory.append({"role": "user", "content": message})
                memory.append({"role": "assistant", "content": reply})
                return {
                    "reply": reply,
                    "movies": [],
                    "taste_profile": taste_doc.model_dump() if taste_doc else None
                }
            
            reply = "I couldn't find any movies matching that exact description, but try adjusting your criteria or asking about your taste profile!"
            return {
                "reply": reply,
                "movies": [],
                "taste_profile": taste_doc.model_dump() if taste_doc else None
            }
            
        # Contextualize movies with rich cinematic metadata for LLM
        from app.content.repositories.movie_repository import MovieRepository
        movie_repo = MovieRepository()
        movie_details_list = []
        for r in recommendations[:4]:
            m = movie_repo.get_movie_by_id(r["movie_id"])
            if m:
                title = m.get("title", "Unknown Movie")
                year = int(m.get("release_year") or 0)
                director = m.get("director", "")
                cast = ", ".join([a.strip() for a in str(m.get("cast", "")).split(",")[:3] if a.strip()])
                genres = m.get("genre_names", "")
                overview = str(m.get("overview", "")).strip()
                rating = m.get("vote_average", "")
                details = f"- **{title}** ({year})"
                if director:
                    details += f" | Dir: {director}"
                if cast:
                    details += f" | Starring: {cast}"
                if rating:
                    details += f" | Rating: {rating}/10"
                if genres:
                    details += f" | Genres: {genres}"
                if overview:
                    details += f"\n  Premise: {overview[:180]}..."
                movie_details_list.append(details)
        
        movies_context_str = "\n".join(movie_details_list) if movie_details_list else "Curated cinematic recommendations"
        
        taste_summary_str = f"Persona: {taste_doc.persona_title}. {taste_doc.summary}" if taste_doc else "Cinephile exploring new titles"
        
        explanation_msg = EXPLANATION_PROMPT.format(
            movies_context=movies_context_str,
            user_message=message,
            user_taste_summary=taste_summary_str
        )
        
        explanation_messages = memory.copy()
        explanation_messages.append({"role": "user", "content": explanation_msg})
        
        reply = llm_client.chat(messages=explanation_messages, temperature=0.7)
        
        # 5. Update Memory
        memory.append({"role": "user", "content": message})
        memory.append({"role": "assistant", "content": reply})
        
        # 6. Recursive Memory summarization
        MAX_MESSAGES = 9 # System + 8
        if len(memory) > MAX_MESSAGES:
            messages_to_summarize = memory[1:-4]
            recent_messages = memory[-4:]
            
            summary_request = SUMMARY_PROMPT.format(
                chat_history="\n".join([f"{m['role']}: {m['content']}" for m in messages_to_summarize])
            )
            
            summary = llm_client.chat([{"role": "user", "content": summary_request}], temperature=0.3)
            
            memory.clear()
            memory.append({"role": "system", "content": self._build_system_prompt(taste_doc_text)})
            memory.append({"role": "system", "content": f"Previous conversation summary: {summary}"})
            memory.extend(recent_messages)
        
        return {
            "reply": reply,
            "movies": recommendations,
            "taste_profile": taste_doc.model_dump() if taste_doc else None
        }

conversation_service = ConversationService()
