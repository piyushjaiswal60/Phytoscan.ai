import tensorflow as tf
import numpy as np
import json
from PIL import Image
import io
from .config import settings
from .schemas import Prediction

class ModelService:
    def __init__(self):
        self.custom_model = None
        self.mobilenet_model = None
        self.labels = []
        self.img_size = (224, 224)

    def load_resources(self):
        """Load models and labels into memory once at startup."""
        print("Loading models... this may take a moment.")
        self.custom_model = tf.keras.models.load_model(settings.CUSTOM_MODEL_PATH)
        self.mobilenet_model = tf.keras.models.load_model(settings.MOBILENET_MODEL_PATH)

        with open(settings.LABELS_PATH, "r") as f:
            self.labels = json.load(f)
        print("All models and labels loaded successfully.")

    def preprocess_image(self, image_bytes: bytes):
        """Standard preprocessing based on training code."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize(self.img_size)
        image_array = np.array(image, dtype=np.float32)
        image_array = np.expand_dims(image_array, axis=0)
        return image_array

    def predict(self, image_bytes: bytes, model_type: str):
        """Perform inference using the specified model."""
        image_array = self.preprocess_image(image_bytes)

        model = self.custom_model if model_type == "custom_cnn" else self.mobilenet_model
        predictions = model.predict(image_array, verbose=0)[0]

        # Get top 3
        top_indices = np.argsort(predictions)[::-1][:3]

        return [
            Prediction(
                class_name=self.labels[i],
                confidence=float(predictions[i])
            )
            for i in top_indices
        ]

# Singleton instance
model_service = ModelService()
