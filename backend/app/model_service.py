"""Load the trained Keras models once and run image predictions."""

import io
import json
import logging
import threading
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from .config import (
    CUSTOM_MODEL_PATH,
    IMAGE_SIZE,
    LABELS_PATH,
    MOBILENET_MODEL_PATH,
)
from .schemas import ModelName, Prediction

logger = logging.getLogger(__name__)


class ModelService:
    """Small inference service for the two saved PhytoScan models."""

    def __init__(self) -> None:
        self.models: dict[str, object] = {}
        self.labels: list[str] = []
        self._prediction_lock = threading.Lock()

    @property
    def is_ready(self) -> bool:
        return (
            "custom_cnn" in self.models
            and "mobilenetv2" in self.models
            and len(self.labels) == 38
        )

    def load_resources(self) -> None:
        """Load both models and labels once when the API starts."""
        import tensorflow as tf

        for path in (CUSTOM_MODEL_PATH, MOBILENET_MODEL_PATH, LABELS_PATH):
            if not Path(path).is_file():
                raise FileNotFoundError(f"Required model asset not found: {path}")

        with open(LABELS_PATH, "r", encoding="utf-8") as label_file:
            labels = json.load(label_file)

        if not isinstance(labels, list) or len(labels) != 38:
            raise ValueError("labels.json must contain exactly 38 class names")

        logger.info("Loading Custom CNN and MobileNetV2 weights...")
        custom_model = tf.keras.models.load_model(
            str(CUSTOM_MODEL_PATH), compile=False
        )
        mobilenet_model = tf.keras.models.load_model(
            str(MOBILENET_MODEL_PATH), compile=False
        )

        for model_name, model in (
            ("custom_cnn", custom_model),
            ("mobilenetv2", mobilenet_model),
        ):
            output_classes = int(model.output_shape[-1])
            if output_classes != len(labels):
                raise ValueError(
                    f"{model_name} returns {output_classes} classes, "
                    f"but labels.json contains {len(labels)}"
                )

        self.models = {
            "custom_cnn": custom_model,
            "mobilenetv2": mobilenet_model,
        }
        self.labels = labels
        logger.info("Both models loaded successfully (%s classes).", len(labels))

    @staticmethod
    def prepare_image(image_bytes: bytes) -> np.ndarray:
        """Resize an image; each trained model applies its own rescaling layer."""
        with Image.open(io.BytesIO(image_bytes)) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image = image.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
            image_array = np.asarray(image, dtype=np.float32)

        # Keep pixel values in the 0-255 range. Both saved models contain
        # their own Rescaling layer, as defined in the training notebook.
        return np.expand_dims(image_array, axis=0)

    def predict(self, image_bytes: bytes, model_name: ModelName) -> list[Prediction]:
        """Return the three highest class probabilities for one model."""
        if not self.is_ready:
            raise RuntimeError("The prediction models are not ready")

        image_batch = self.prepare_image(image_bytes)
        model = self.models[model_name]

        # One API worker is used in Docker. The lock also protects model calls
        # if the application is later served with concurrent request threads.
        with self._prediction_lock:
            probabilities = model.predict(image_batch, verbose=0)[0]

        if len(probabilities) != len(self.labels):
            raise ValueError("Model output does not match the class label list")

        best_indices = np.argsort(probabilities)[::-1][:3]
        return [
            Prediction(
                class_name=self.labels[int(index)],
                confidence=float(probabilities[index]),
            )
            for index in best_indices
        ]


model_service = ModelService()
