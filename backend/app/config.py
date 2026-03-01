import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the backend directory path
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Settings
    APP_NAME: str = "PhishPulse API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 1      # Default session without "remember me"
    REMEMBER_ME_EXPIRE_DAYS: int = 30      # Extended session with "remember me"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR}/phishpulse.db"
    
    # Email Settings
    FROM_EMAIL: str = "noreply@phishpulse.com"  # Customize your sender email
    
    # Brevo API (for transactional emails and OTP)
    BREVO_API_KEY: str = ""  # Get from https://app.brevo.com/settings/keys/api
    
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Create a global settings instance
settings = Settings()
