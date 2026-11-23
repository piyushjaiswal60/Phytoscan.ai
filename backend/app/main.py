"""FastAPI endpoints for plant-disease classification."""

import io
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import ValidationError

from .config import APP_NAME, CORS_ORIGINS, MAX_UPLOAD_SIZE
from .model_service import model_service
from .schemas import (
    CompareResponse,
    ImageUploadMetadata,
    ModelName,
    PredictionResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Load model weights once before accepting requests."""
    model_service.load_resources()
    yield


app = FastAPI(
    title=APP_NAME,
    description="Plant disease classification using Custom CNN and MobileNetV2.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


async def read_valid_image(file: UploadFile) -> bytes:
    """Check upload metadata and confirm that the bytes are a real JPEG/PNG."""
    contents = await file.read(MAX_UPLOAD_SIZE + 1)

    try:
        ImageUploadMetadata(
            filename=file.filename or "uploaded-image",
            content_type=file.content_type or "",
            size=len(contents),
        )
    except ValidationError as error:
        fields = {str(item["loc"][0]) for item in error.errors()}
        if "size" in fields:
            raise HTTPException(
                status_code=413,
                detail="Image is too large. Please upload an image up to 5 MB.",
            ) from error
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a JPEG or PNG image.",
        ) from error

    try:
        with Image.open(io.BytesIO(contents)) as image:
            if image.format not in {"JPEG", "PNG"}:
                raise HTTPException(
                    status_code=415,
                    detail="The file content is not a supported JPEG or PNG image.",
                )
            image.verify()
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        ) from error

    return contents


@app.get("/health")
async def health_check() -> dict[str, object]:
    """Container health endpoint."""
    return {
        "status": "healthy" if model_service.is_ready else "starting",
        "models_loaded": model_service.is_ready,
        "classes_count": len(model_service.labels),
    }


@app.get("/models")
async def list_models() -> dict[str, object]:
    return {
        "available_models": ["custom_cnn", "mobilenetv2"],
        "classes_count": len(model_service.labels),
        "image_size": [224, 224],
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    model: ModelName = Query(..., description="custom_cnn or mobilenetv2"),
) -> PredictionResponse:
    image_bytes = await read_valid_image(file)

    try:
        predictions = model_service.predict(image_bytes, model)
    except Exception as error:
        logger.exception("Prediction failed for %s", model)
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Please check the server logs.",
        ) from error

    return PredictionResponse(model_name=model, predictions=predictions)


@app.post("/predict/compare", response_model=CompareResponse)
async def compare_models(file: UploadFile = File(...)) -> CompareResponse:
    image_bytes = await read_valid_image(file)

    try:
        custom_predictions = model_service.predict(image_bytes, "custom_cnn")
        mobilenet_predictions = model_service.predict(image_bytes, "mobilenetv2")
    except Exception as error:
        logger.exception("Model comparison failed")
        raise HTTPException(
            status_code=500,
            detail="Model comparison failed. Please check the server logs.",
        ) from error

    custom_response = PredictionResponse(
        model_name="custom_cnn", predictions=custom_predictions
    )
    mobilenet_response = PredictionResponse(
        model_name="mobilenetv2", predictions=mobilenet_predictions
    )

    return CompareResponse(
        custom_cnn=custom_response,
        mobilenetv2=mobilenet_response,
        agreement=(
            custom_predictions[0].class_name
            == mobilenet_predictions[0].class_name
        ),
    )
