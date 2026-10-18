from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List

from .config import settings
from .schemas import PredictionResponse, CompareResponse
from .model_service import model_service

app = FastAPI(title=settings.APP_NAME)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    model_service.load_resources()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": model_service.custom_model is not None}

@app.get("/models")
async def list_models():
    return {
        "available_models": ["custom_cnn", "mobilenetv2"],
        "classes_count": len(model_service.labels)
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    model: str = Query(..., regex="^(custom_cnn|mobilenetv2)$")
):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are supported.")

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 5MB.")

    try:
        predictions = model_service.predict(contents, model)
        return PredictionResponse(model_name=model, predictions=predictions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/compare", response_model=CompareResponse)
async def compare_predict(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large.")

    try:
        custom_res = model_service.predict(contents, "custom_cnn")
        mobile_res = model_service.predict(contents, "mobilenetv2")

        # Agreement based on the top prediction
        agreement = custom_res[0].class_name == mobile_res[0].class_name

        return CompareResponse(
            custom_cnn=PredictionResponse(model_name="custom_cnn", predictions=custom_res),
            mobilenetv2=PredictionResponse(model_name="mobilenetv2", predictions=mobile_res),
            agreement=agreement
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
