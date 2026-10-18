# Use Python 3.11 slim to avoid PyO3/Pydantic-core compilation issues
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for OpenCV/TensorFlow
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Layer Caching: Install dependencies first
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app /app/backend/app

# Copy root assets (Models and Labels)
COPY models /app/models
COPY labels.json /app/labels.json

# Expose the FastAPI port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
