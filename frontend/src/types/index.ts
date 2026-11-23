export type ModelName = "custom_cnn" | "mobilenetv2";
export interface Prediction { class_name: string; confidence: number; }
export interface PredictionResponse { model_name: ModelName; predictions: Prediction[]; }
export interface CompareResponse { custom_cnn: PredictionResponse; mobilenetv2: PredictionResponse; agreement: boolean; }
export interface HealthResponse { status: string; models_loaded: boolean; classes_count: number; }
