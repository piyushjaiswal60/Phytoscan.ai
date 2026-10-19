
import io

from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.model_service import model_service

client = TestClient(app)

# Explicitly load models for tests because TestClient doesn't always
# trigger @app.on_event("startup") in all pytest environments
model_service.load_resources()


def create_test_image():
    """Create a valid PNG image in memory without needing a physical file."""
    image = Image.new("RGB", (32, 32), color="green")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_health_check():
    """Test the /health endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_models():
    """Test the /models endpoint returns available models."""
    response = client.get("/models")
    assert response.status_code == 200

    data = response.json()
    assert "available_models" in data
    assert isinstance(data["available_models"], list)
    assert len(data["available_models"]) > 0


def test_predict_success():
    """Test /predict returns top-3 predictions for a valid image."""
    file = create_test_image()

    response = client.post(
        "/predict",
        files={"file": ("test_leaf.png", file, "image/png")},
        params={"model": "custom_cnn"},
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 3

    for prediction in data["predictions"]:
        assert "class_name" in prediction
        assert "confidence" in prediction


def test_predict_compare_success():
    """Test /predict/compare returns results for both models."""
    file = create_test_image()

    response = client.post(
        "/predict/compare",
        files={"file": ("test_leaf.png", file, "image/png")},
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert "custom_cnn" in data
    assert "mobilenetv2" in data
    assert len(data["custom_cnn"]["predictions"]) == 3
    assert len(data["mobilenetv2"]["predictions"]) == 3


def test_predict_invalid_file():
    """Test /predict rejects non-image files."""
    file = io.BytesIO(b"this is a text file, not an image")

    response = client.post(
        "/predict",
        files={"file": ("test.txt", file, "text/plain")},
        params={"model": "custom_cnn"},
    )

    assert response.status_code == 400


def test_predict_invalid_model():
    """Test /predict rejects unsupported model names."""
    file = create_test_image()

    response = client.post(
        "/predict",
        files={"file": ("test_leaf.png", file, "image/png")},
        params={"model": "gpt-5"},
    )

    assert response.status_code == 422
