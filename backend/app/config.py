from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path


class Settings(BaseSettings):
    database_url: str = Field(
        default="sqlite:///./tickets.db",
        description="Database connection URL"
    )

    class Config:
        env_file = Path(__file__).parent.parent.parent / ".env"
        case_sensitive = False

settings = Settings()