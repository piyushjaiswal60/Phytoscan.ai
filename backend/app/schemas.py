import json
from pydantic import BaseModel
from typing import List

class Prediction(BaseModel):
    class_name: str
    confidence: float

class PredictionResponse(BaseModel):
    model_name: str
    predictions: List[Prediction]

class CompareResponse(BaseModel):
    custom_cnn: PredictionResponse
    mobilenetv2: PredictionResponse
    agreement: bool
