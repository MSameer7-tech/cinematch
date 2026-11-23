from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class AISettings(BaseSettings):
    ai_provider: str = "groq"
    default_model: str = "openai/gpt-oss-20b"
    groq_api_key: Optional[str] = None
    groq_base_url: str = "https://api.groq.com/openai/v1"
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

ai_settings = AISettings()
