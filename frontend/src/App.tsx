import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowUpRight, Check, CheckCircle2, CircleAlert,
  CloudUpload, Cpu, FlaskConical, Leaf, LoaderCircle, Moon, ScanLine,
  ShieldCheck, Sprout, Sun, Workflow,
} from "lucide-react";
import { checkHealth, compareModels, predictSingle } from "./api";
import { ImageDropzone } from "./components/ImageDropzone";
import { PredictionCard } from "./components/PredictionCard";
import type { CompareResponse, HealthResponse, ModelName, PredictionResponse } from "./types";

type ScanMode = "compare" | ModelName;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<ScanMode>("compare");
  const [results, setResults] = useState<CompareResponse | PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => { checkHealth().then(setHealth).catch(() => setHealth(null)); }, []);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const isComparison = mode === "compare";
  const resultCards = useMemo(() => {
    if (!results) return [];
    if ("custom_cnn" in results) return [results.custom_cnn, results.mobilenetv2];
    return [results];
  }, [results]);

  function handleFileChange(nextFile: File | null, validationError?: string) {
    setFile(nextFile);
    setResults(null);
    setError(validationError || null);
  }

  async function handleScan() {
    if (!file) { setError("Upload a clear leaf image before starting the scan."); return; }
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = isComparison ? await compareModels(file) : await predictSingle(file, mode);
      setResults(response);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  }

  const agreement = results && "agreement" in results ? results.agreement : null;
  const modelsReady = health?.models_loaded === true;

  return (
    <div className={`app-shell ${isDark ? "is-dark" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PhytoScan AI home"><span className="brand-mark"><Leaf size={21} strokeWidth={2.4} /></span><span className="brand-name">phyto<span>scan</span><b>.ai</b></span></a>
        <div className="topbar-right">
          <div className={`service-status ${modelsReady ? "online" : "offline"}`}><span className="status-dot" />{modelsReady ? "AI engine ready" : "API connection"}</div>
          <button type="button" className="theme-toggle" onClick={() => setIsDark((current) => !current)} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </header>

      <main id="top" className="page-content">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> PLANT HEALTH INTELLIGENCE</div>
            <h1>A healthier harvest<br /><em>starts with insight.</em></h1>
            <p>Upload a leaf photo and let AI help you identify plant diseases, understand prediction confidence, and compare two deep-learning models.</p>
            <div className="hero-points"><span><ShieldCheck size={15} /> AI-powered screening</span><span><Activity size={15} /> Two-model analysis</span></div>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-leaf"><Sprout size={86} strokeWidth={1.1} /></div><div className="floating-chip chip-top"><span className="chip-check"><Check size={12} /></span> Leaf analysis</div><div className="floating-chip chip-bottom"><span className="chip-pulse" /> 38 disease classes</div></div>
        </section>

        <section className="metrics-strip" aria-label="Application capabilities">
          <div className="metric-item"><span className="metric-icon"><ScanLine size={18} /></span><div><strong>38</strong><span>Disease classes</span></div></div><div className="metric-separator" />
          <div className="metric-item"><span className="metric-icon"><Cpu size={18} /></span><div><strong>2</strong><span>Deep learning models</span></div></div><div className="metric-separator" />
          <div className="metric-item"><span className="metric-icon"><Workflow size={18} /></span><div><strong>224 × 224</strong><span>Model input resolution</span></div></div><div className="metric-separator" />
          <div className="metric-item"><span className="metric-icon"><FlaskConical size={18} /></span><div><strong>Top 3</strong><span>Prediction probabilities</span></div></div>
        </section>

        <section className="workspace-heading"><div><div className="section-kicker">THE SCANNER</div><h2>Run a plant health scan</h2><p>Follow the two steps below to analyse a leaf image.</p></div><div className="step-indicator"><span className="step-number">01</span><span className="step-line" /><span className="step-number muted">02</span></div></section>

        <section className="workspace-grid">
          <div className="left-column">
            <article className="panel upload-panel">
              <div className="panel-heading"><div className="panel-step">01</div><div><h3>Upload leaf image</h3><p>Choose a clear, well-lit photo of a plant leaf.</p></div></div>
              <ImageDropzone file={file} preview={preview} onFileChange={handleFileChange} />
              <div className="upload-footnote"><ShieldCheck size={14} /> Your image is processed by the model and is not stored by this application.</div>
            </article>

            <article className="panel model-panel">
              <div className="panel-heading"><div className="panel-step">02</div><div><h3>Choose analysis mode</h3><p>Compare both models or run one independently.</p></div></div>
              <div className="mode-options">
                <button type="button" className={`mode-card ${mode === "compare" ? "selected" : ""}`} onClick={() => { setMode("compare"); setResults(null); }}><span className="mode-radio">{mode === "compare" && <span />}</span><span className="mode-card-icon compare-icon"><Workflow size={18} /></span><span className="mode-card-copy"><strong>Compare both</strong><small>Recommended · 2 models</small></span><span className="mode-badge">COMPARE</span></button>
                <button type="button" className={`mode-card ${mode === "custom_cnn" ? "selected" : ""}`} onClick={() => { setMode("custom_cnn"); setResults(null); }}><span className="mode-radio">{mode === "custom_cnn" && <span />}</span><span className="mode-card-icon cnn-icon"><Cpu size={18} /></span><span className="mode-card-copy"><strong>Custom CNN</strong><small>Lightweight custom architecture</small></span></button>
                <button type="button" className={`mode-card ${mode === "mobilenetv2" ? "selected" : ""}`} onClick={() => { setMode("mobilenetv2"); setResults(null); }}><span className="mode-radio">{mode === "mobilenetv2" && <span />}</span><span className="mode-card-icon mobile-icon"><Activity size={18} /></span><span className="mode-card-copy"><strong>MobileNetV2</strong><small>Transfer learning architecture</small></span></button>
              </div>
              {error && <div className="error-message" role="alert"><CircleAlert size={16} /> {error}</div>}
              <button type="button" className="scan-button" disabled={!file || isLoading} onClick={handleScan}>{isLoading ? <><LoaderCircle className="spin" size={18} /> Analysing leaf image...</> : <><ScanLine size={18} /> Start AI analysis <ArrowUpRight size={17} /></>}</button>
              <div className="scan-note"><Activity size={13} /> {isComparison ? "Both models will analyse the same image." : "Only the selected model will be used."}</div>
            </article>
          </div>

          <div className="right-column" id="results">
            <article className="panel results-panel">
              <div className="results-header"><div><div className="section-kicker">ANALYSIS OUTPUT</div><h3>Scan results</h3></div><span className={`results-state ${results ? "complete" : "waiting"}`}><span />{results ? "Analysis complete" : isLoading ? "Processing" : "Awaiting scan"}</span></div>
              {!results && !isLoading && <div className="empty-results"><div className="empty-illustration"><div className="empty-ring" /><Leaf size={44} strokeWidth={1.35} /></div><h4>Your results will appear here</h4><p>Upload a leaf image, select an analysis mode, and start the scan to see the model predictions.</p><div className="empty-hint"><ArrowDown size={14} /> Begin with step 01</div></div>}
              {isLoading && <div className="loading-state"><div className="loading-orb"><LoaderCircle className="spin" size={33} /></div><h4>Reading leaf patterns</h4><p>Preparing image and running the selected deep-learning model{isComparison ? "s" : ""}.</p><div className="loading-track"><span /></div></div>}
              {results && <div className="results-content">
                {agreement !== null && <div className={`agreement-banner ${agreement ? "agreed" : "diverged"}`}>{agreement ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}<div><strong>{agreement ? "Both models agree" : "Different model predictions"}</strong><span>{agreement ? "Both models returned the same top-ranked class." : "The models returned different top-ranked classes. Review both probability distributions."}</span></div></div>}
                <div className={`result-cards ${resultCards.length === 1 ? "single-result" : ""}`}>{resultCards.map((result) => <PredictionCard key={result.model_name} result={result} />)}</div>
                <div className="result-disclaimer"><ShieldCheck size={15} /><span>Predictions are AI-generated screening results, not a substitute for expert agricultural diagnosis.</span></div>
                <button type="button" className="reset-button" onClick={() => { setResults(null); setError(null); }}><ScanLine size={15} /> Run another analysis</button>
              </div>}
            </article>
            <div className="insight-card"><div className="insight-icon"><Sprout size={20} /></div><div><strong>A note on confidence</strong><p>Confidence scores show how strongly a model favours a class among the 38 labels it learned during training. They are not a guarantee of diagnostic accuracy.</p></div></div>
          </div>
        </section>

        <section className="pipeline-section"><div className="pipeline-heading"><div className="section-kicker">UNDER THE HOOD</div><h2>From leaf image to insight</h2><p>A simple inference pipeline powers every scan.</p></div><div className="pipeline-steps">
          <div className="pipeline-step"><span className="pipeline-number">01</span><div className="pipeline-icon"><CloudUpload size={20} /></div><strong>Image upload</strong><span>JPEG or PNG validation</span></div><div className="pipeline-connector" />
          <div className="pipeline-step"><span className="pipeline-number">02</span><div className="pipeline-icon"><ScanLine size={20} /></div><strong>Preprocessing</strong><span>224 × 224 RGB image</span></div><div className="pipeline-connector" />
          <div className="pipeline-step"><span className="pipeline-number">03</span><div className="pipeline-icon"><Cpu size={20} /></div><strong>Model inference</strong><span>Custom CNN / MobileNetV2</span></div><div className="pipeline-connector" />
          <div className="pipeline-step"><span className="pipeline-number">04</span><div className="pipeline-icon"><CheckCircle2 size={20} /></div><strong>Top predictions</strong><span>Class and confidence scores</span></div>
        </div></section>
      </main>
      <footer className="footer"><a className="footer-brand" href="#top"><span className="footer-mark"><Leaf size={15} /></span> phyto<span>scan</span><b>.ai</b></a><span>Built with TensorFlow, FastAPI, React & Docker</span><span className="footer-copy">Plant disease classification · 38 classes</span></footer>
    </div>
  );
}

export default App;
