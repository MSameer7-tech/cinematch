from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelCapability(BaseModel):
    supports_json: bool
    supports_streaming: bool
    max_context: int
    temperature_range: tuple[float, float]

class BaseProvider(ABC):
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], model: Optional[str] = None, json_mode: bool = False, temperature: float = 0.7) -> str:
        """Sends a chat completion request to the provider."""
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """Checks if the provider API is accessible."""
        pass

    @abstractmethod
    def list_models(self) -> List[str]:
        """Lists available models from the provider."""
        pass
        
    @abstractmethod
    def get_capabilities(self, model: str) -> ModelCapability:
        """Returns the capabilities of a specific model."""
        pass
