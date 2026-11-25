from typing import Dict, List, Optional
from groq import Groq
from app.ai.providers.base_provider import BaseProvider, ModelCapability
from app.ai.config import ai_settings

class GroqProvider(BaseProvider):
    def __init__(self):
        self.client = Groq(
            api_key=ai_settings.groq_api_key,
        )
        self.default_model = ai_settings.default_model

    def chat(self, messages: List[Dict[str, str]], model: Optional[str] = None, json_mode: bool = False, temperature: float = 0.7) -> str:
        target_model = model or self.default_model
        
        kwargs = {
            "messages": messages,
            "model": target_model,
            "temperature": temperature
        }
        
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
            
        try:
            chat_completion = self.client.chat.completions.create(**kwargs)
            return chat_completion.choices[0].message.content or ""
        except Exception as e:
            print(f"[GroqProvider] Error during chat completion: {e}")
            if json_mode:
                return "{}"
            return ""

    def health_check(self) -> bool:
        try:
            self.list_models()
            return True
        except Exception:
            return False

    def list_models(self) -> List[str]:
        models = self.client.models.list()
        return [m.id for m in models.data]
        
    def get_capabilities(self, model: str) -> ModelCapability:
        # Groq currently has general capabilities across its fast models
        return ModelCapability(
            supports_json=True,
            supports_streaming=True,
            max_context=8192,
            temperature_range=(0.0, 2.0)
        )
