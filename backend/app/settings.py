from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Brain Dump Local API"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    data_dir: Path = Path("data")
    database_path: Path = Path("data/brain_dump.sqlite3")
    upload_dir: Path = Path("data/uploads")
    embedding_dimensions: int = 384
    llama_base_url: str | None = None
    llama_model: str = "local-model"
    max_file_mb: int = 25

    model_config = SettingsConfigDict(env_file=".env", env_prefix="BRAIN_")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    return settings
