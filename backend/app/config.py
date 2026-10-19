import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Phytoscan AI Backend"
    DEBUG: bool = True

    # Model Settings
    # These paths are relative to the project root
    CUSTOM_MODEL_PATH: str = "models/best_custom_cnn.keras"
    MOBILENET_MODEL_PATH: str = "models/mobilenetv2.keras"
    LABELS_PATH: str = "labels.json"

    # API Settings
    CORS_ORIGINS: List[str] = ["*"]
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
