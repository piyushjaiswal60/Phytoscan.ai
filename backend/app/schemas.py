"""Request and response schemas used by the API."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from .config import MAX_UPLOAD_SIZE


ModelName = Literal["custom_cnn", "mobilenetv2"]


class ImageUploadMetadata(BaseModel):
    """Validate the upload metadata before decoding image bytes."""

    model_config = ConfigDict(str_strip_whitespace=True)

    filename: str = Field(min_length=1, max_length=255)
    content_type: Literal["image/jpeg", "image/png"]
    size: int = Field(gt=0, le=MAX_UPLOAD_SIZE)


class Prediction(BaseModel):
    class_name: str
    confidence: float = Field(ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    model_name: ModelName
    predictions: list[Prediction]


class CompareResponse(BaseModel):
    custom_cnn: PredictionResponse
    mobilenetv2: PredictionResponse
    agreement: bool
