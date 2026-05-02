from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "Pickaxe Mini API"
    app_version: str = "1.0.0"
    debug: bool = False

    # CORS — Next.js dev server
    cors_origins: list[str] = ["http://localhost:3000"]

    # Gemini
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"


settings = Settings()