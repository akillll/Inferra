from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = Field(default="Inferra", alias="PROJECT_NAME")
    api_version: str = Field(default="0.1.0", alias="API_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")

    database_url: str = Field(
        default="postgresql+psycopg://inferra:inferra@postgres:5432/inferra",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
