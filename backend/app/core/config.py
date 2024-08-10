from pydantic import BaseSettings, AnyHttpUrl
from typing import List
import secrets

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    SERVER_NAME: str = "FinalRAGConverterPlease"
    SERVER_HOST: AnyHttpUrl = "https://api.finalragconverterplease.com"
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # React default port
        "https://finalragconverterplease.com"  # Your production frontend URL
    ]
    PROJECT_NAME: str = "FinalRAGConverterPlease"

    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: str = None

    FREE_TIER_LIMIT: int = 5  # Number of free conversions

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
