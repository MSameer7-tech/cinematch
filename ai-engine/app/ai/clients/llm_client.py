from typing import Dict, List, Optional
from app.ai.config import ai_settings
from app.ai.providers.base_provider import BaseProvider

class LLMClient:
    def __init__(self):
        self.provider: BaseProvider = self._initialize_provider()
        
    def _initialize_provider(self) -> BaseProvider:
        provider_name = ai_settings.ai_provider.lower()
        if provider_name == "groq":
            from app.ai.providers.groq_provider import GroqProvider
            return GroqProvider()
        else:
            raise ValueError(f"Unsupported AI Provider: {provider_name}")

    def chat(self, messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.7) -> str:
        return self.provider.chat(messages=messages, json_mode=json_mode, temperature=temperature)

llm_client = LLMClient()
