from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "BankingWorkflowSystem"
    APP_ENV: str = "production"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "banking_workflow"
    POSTGRES_USER: str = "banking_user"
    POSTGRES_PASSWORD: str = "SecureBankingPass2024!"
    DATABASE_URL: str = "postgresql+asyncpg://banking_user:SecureBankingPass2024!@db:5432/banking_workflow"

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"
    WORKERS: int = 4

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
