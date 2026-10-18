export interface Prediction {
  class_name: string;
  confidence: number;
}

export interface PredictionResponse {
  model_name: string;
  predictions: Prediction[];
}

export interface CompareResponse {
  custom_cnn: PredictionResponse;
  mobilenetv2: PredictionResponse;
  agreement: boolean;
}
