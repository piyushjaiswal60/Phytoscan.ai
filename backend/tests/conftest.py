import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
import io
from PIL import Image

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient for API requests.
    """
    return TestClient(app)

@pytest.fixture
def sample_image():
    """
    Generates a valid in-memory JPEG image for testing.
    """
    file = io.BytesIO()
    image = Image.new("RGB", (224, 224), color="green")
    image.save(file, "JPEG")
    file.seek(0)
    return file

@pytest.fixture
def invalid_file():
    """
    Generates a fake PDF file for testing invalid uploads.
    """
    file = io.BytesIO(b"This is a fake PDF content")
    file.seek(0)
    return file
