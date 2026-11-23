import type { CompareResponse, HealthResponse, ModelName, PredictionResponse } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function upload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}${path}`, { method: "POST", body: form });
  if (!response.ok) {
    let message = "The scan could not be completed. Please try again.";
    try {
      const body = (await response.json()) as { detail?: string };
      message = body.detail || message;
    } catch { /* Use the fallback for non-JSON responses. */ }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error("API is unavailable");
  return (await response.json()) as HealthResponse;
}

export function predictSingle(file: File, model: ModelName): Promise<PredictionResponse> {
  return upload<PredictionResponse>(`/predict?model=${encodeURIComponent(model)}`, file);
}

export function compareModels(file: File): Promise<CompareResponse> {
  return upload<CompareResponse>("/predict/compare", file);
}
