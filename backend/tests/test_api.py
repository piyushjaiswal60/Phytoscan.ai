"""API tests use a lightweight fake predictor; they do not load TensorFlow."""

import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.app.main import app
from backend.app.model_service import model_service
from backend.app.schemas import Prediction


@pytest.fixture()
def client(monkeypatch):
    def fake_load_resources():
        model_service.labels = [f"class_{index}" for index in range(38)]
        model_service.models = {"custom_cnn": object(), "mobilenetv2": object()}

    def fake_predict(_image_bytes, model_name):
        label = "Grape___Black_rot" if model_name == "custom_cnn" else "Grape___Black_rot"
        return [
            Prediction(class_name=label, confidence=0.96),
            Prediction(class_name="Grape___Esca_(Black_Measles)", confidence=0.02),
            Prediction(class_name="Tomato___Early_blight", confidence=0.01),
        ]

    monkeypatch.setattr(model_service, "load_resources", fake_load_resources)
    monkeypatch.setattr(model_service, "predict", fake_predict)

    with TestClient(app) as test_client:
        yield test_client


def make_png() -> io.BytesIO:
    image = Image.new("RGB", (40, 40), color=(30, 130, 60))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["models_loaded"] is True


def test_models_endpoint(client):
    response = client.get("/models")
    assert response.status_code == 200
    assert response.json()["available_models"] == ["custom_cnn", "mobilenetv2"]
    assert response.json()["classes_count"] == 38


def test_single_model_prediction(client):
    response = client.post(
        "/predict",
        files={"file": ("leaf.png", make_png(), "image/png")},
        params={"model": "custom_cnn"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["model_name"] == "custom_cnn"
    assert len(data["predictions"]) == 3
    assert data["predictions"][0]["class_name"] == "Grape___Black_rot"


def test_compare_prediction(client):
    response = client.post(
        "/predict/compare",
        files={"file": ("leaf.png", make_png(), "image/png")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["agreement"] is True
    assert len(data["custom_cnn"]["predictions"]) == 3
    assert len(data["mobilenetv2"]["predictions"]) == 3


def test_rejects_non_image_upload(client):
    response = client.post(
        "/predict",
        files={"file": ("notes.txt", io.BytesIO(b"not an image"), "text/plain")},
        params={"model": "custom_cnn"},
    )
    assert response.status_code == 415


def test_rejects_corrupt_image(client):
    response = client.post(
        "/predict",
        files={"file": ("broken.png", io.BytesIO(b"not really a png"), "image/png")},
        params={"model": "custom_cnn"},
    )
    assert response.status_code == 400


def test_rejects_unsupported_model(client):
    response = client.post(
        "/predict",
        files={"file": ("leaf.png", make_png(), "image/png")},
        params={"model": "unknown-model"},
    )
    assert response.status_code == 422


def test_rejects_large_image(client):
    large_file = io.BytesIO(b"0" * (5 * 1024 * 1024 + 1))
    response = client.post(
        "/predict",
        files={"file": ("large.png", large_file, "image/png")},
        params={"model": "custom_cnn"},
    )
    assert response.status_code == 413
