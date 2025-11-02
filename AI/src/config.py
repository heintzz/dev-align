from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    UPLOAD_DIR: str = "temp"
    
    LLM_MODEL_CV: str
    LLM_BASE_URL_CV: str
    EMBEDDING_MODEL: str
    LLM_BASE_URL_ROSTER: str
    LLM_API_KEY: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()