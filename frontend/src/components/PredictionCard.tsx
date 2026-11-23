import { Activity, CheckCircle2, Sprout } from "lucide-react";
import type { PredictionResponse } from "../types";

function formatClassName(rawName: string) {
  const [rawCrop = "Plant", rawDisease = "Unknown"] = rawName.split("___");
  const clean = (value: string) => value.replaceAll("_", " ").replaceAll(",", "").replace(/\s+/g, " ").trim();
  return { crop: clean(rawCrop), disease: clean(rawDisease) };
}

export function PredictionCard({ result }: { result: PredictionResponse }) {
  const best = result.predictions[0];
  if (!best) return null;
  const bestName = formatClassName(best.class_name);
  const modelName = result.model_name === "custom_cnn" ? "Custom CNN" : "MobileNetV2";

  return (
    <article className="result-card">
      <div className="result-card-header">
        <div className="model-identity">
          <span className="model-icon"><Activity size={17} /></span>
          <div><strong>{modelName}</strong><span>Model prediction</span></div>
        </div>
        <span className="result-tag"><CheckCircle2 size={13} /> Complete</span>
      </div>
      <div className="primary-prediction">
        <div className="prediction-eyebrow"><Sprout size={14} /> Most likely result</div>
        <div className="prediction-main">
          <div><span className="crop-name">{bestName.crop}</span><h3>{bestName.disease}</h3></div>
          <div className="confidence-number"><strong>{(best.confidence * 100).toFixed(2)}%</strong><span>confidence</span></div>
        </div>
        <div className="confidence-track"><span style={{ width: `${Math.max(best.confidence * 100, 1)}%` }} /></div>
      </div>
      <div className="alternatives-heading"><strong>Other possibilities</strong><span>Top 3 classes</span></div>
      <div className="alternative-list">
        {result.predictions.slice(1).map((prediction, index) => {
          const name = formatClassName(prediction.class_name);
          return (
            <div className="alternative-row" key={prediction.class_name}>
              <div className="alternative-copy"><span className="alternative-rank">0{index + 2}</span><div><strong>{name.disease}</strong><span>{name.crop}</span></div></div>
              <div className="alternative-value"><span>{(prediction.confidence * 100).toFixed(2)}%</span><div className="mini-track"><span style={{ width: `${Math.max(prediction.confidence * 100, 0.5)}%` }} /></div></div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
