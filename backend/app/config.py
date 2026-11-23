"""Central application settings."""

import os
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]

APP_NAME = os.getenv("APP_NAME", "PhytoScan AI API")
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", str(5 * 1024 * 1024)))
IMAGE_SIZE = (224, 224)

CUSTOM_MODEL_PATH = Path(
    os.getenv("CUSTOM_MODEL_PATH", PROJECT_ROOT / "models" / "best_custom_cnn.keras")
)
MOBILENET_MODEL_PATH = Path(
    os.getenv("MOBILENET_MODEL_PATH", PROJECT_ROOT / "models" / "mobilenetv2.keras")
)
LABELS_PATH = Path(os.getenv("LABELS_PATH", PROJECT_ROOT / "labels.json"))

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
