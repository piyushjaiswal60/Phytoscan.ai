import React, { useState } from 'react';
import { Scan, Sun, Moon, Leaf, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils';
import { Prediction, PredictionResponse, CompareResponse } from './types';
import { ImageUpload } from './components/ImageUpload';

const ThemeToggle = ({ isDark, toggle }: { isDark: boolean; toggle: () => void }) => (
  <button
    onClick={toggle}
    className="p-2 rounded-full transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:ring-2 ring-primary-500"
  >
    {isDark ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

const ResultBar = ({ label, value, rank }: { label: string; value: number; rank: number }) => {
  const cleanLabel = label
    .replace('___', ': ')
    .replace(/_/g, ' ');

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${rank * 100}ms` }}>
      <div className="flex justify-between mb-2 text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{cleanLabel}</span>
        <span className="font-mono text-slate-500 dark:text-slate-400">{(value * 100).toFixed(2)}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-colors duration-500",
            value > 0.8 ? "bg-green-500" : value > 0.5 ? "bg-yellow-500" : "bg-rose-500"
          )}
        />
      </div>
    </div>
  );
};

const ModelCard = ({ id, name, selected, onSelect }: { id: string; name: string; selected: boolean; onSelect: (id: string) => void }) => (
  <div
    onClick={() => onSelect(id)}
    className={cn(
      "cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3",
      selected
        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20 shadow-md"
        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-300 dark:hover:border-primary-700"
    )}
  >
    <div className={cn(
      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
      selected ? "bg-primary-500 border-primary-500 scale-110" : "border-slate-300 dark:border-slate-600"
    )}>
      {selected && <div className="w-2 h-2 bg-white rounded-full" />}
    </div>
    <span className={cn("font-medium transition-colors", selected ? "text-primary-700 dark:text-primary-400" : "text-slate-600 dark:text-slate-400")}>
      {name}
    </span>
  </div>
);

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['custom_cnn']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: PredictionResponse } | null>(null);
  const [agreement, setAgreement] = useState<boolean | null>(null);

  const toggleModel = (id: string) => {
    setSelectedModels(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
    setResults(null);
  };

  const runScan = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', image);

    try {
      if (selectedModels.length === 1) {
        const model = selectedModels[0];
        const response = await fetch(`/api/predict?model=${model}`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data: PredictionResponse = await response.json();
        setResults({ [model]: data });
        setAgreement(null);
      } else {
        const response = await fetch('/api/predict/compare', {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data: CompareResponse = await response.json();
        setResults({
          custom_cnn: data.custom_cnn,
          mobilenetv2: data.mobilenetv2
        });
        setAgreement(data.agreement);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-300 ease-in-out", isDark ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900")}>
      <header className="sticky top-0 z-50 glass-nav px-4 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="p-2 bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-500/30">
            <Leaf size={24} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-400 dark:to-primary-200">
            PhytoScan.AI
          </span>
        </div>
        <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold">1</span>
            <h3 className="text-xl font-semibold">Upload Plant Image</h3>
          </div>
          <div className="card p-6 space-y-6">
            <ImageUpload
              image={image}
              setImage={setImage}
              preview={preview}
              setPreview={setPreview}
              error={error}
              setError={setError}
            />
          </div>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold">2</span>
            <h3 className="text-xl font-semibold">Configure AI Models</h3>
          </div>
          <div className="card p-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModelCard id="custom_cnn" name="Custom CNN" selected={selectedModels.includes('custom_cnn')} onSelect={toggleModel} />
              <ModelCard id="mobilenetv2" name="MobileNetV2" selected={selectedModels.includes('mobilenetv2')} onSelect={toggleModel} />
            </div>
            <button
              disabled={!image || isLoading}
              onClick={runScan}
              className={cn(
                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300",
                !image || isLoading
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                  : "bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/30 transform hover:-translate-y-1 active:scale-95"
              )}
            >
              {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Scan size={22} />}
              {isLoading ? "Processing Image..." : "Start Scan"}
            </button>
          </div>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold">3</span>
            <h3 className="text-xl font-semibold">Analysis Results</h3>
          </div>
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 shadow-lg shadow-rose-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-800 rounded-lg">
                      <AlertCircle size={20} />
                    </div>
                    <span className="text-sm font-bold">{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </motion.div>
              )}
              {!results && !isLoading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 text-center card"
                >
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                    <Leaf size={40} />
                  </div>
                  <p className="max-w-xs mx-auto">Results will appear here after the scan is complete.</p>
                </motion.div>
              )}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 text-center card">
                  <div className="relative">
                    <Loader2 className="animate-spin w-12 h-12 mb-4 text-primary-500" />
                    <div className="absolute inset-0 blur-xl bg-primary-500/20 animate-pulse rounded-full" />
                  </div>
                  <p className="font-medium">Consulting AI Models...</p>
                  <span className="text-xs mt-2 opacity-60">Processing image pixels...</span>
                </div>
              )}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {agreement !== null && (
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center gap-3 transition-all animate-in zoom-in-95 duration-300",
                      agreement
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                    )}>
                      {agreement ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                      <span className="text-sm font-bold">
                        {agreement ? "Perfect Agreement: Both models identified the same disease!" : "Prediction Variance: Models have different findings."}
                      </span>
                    </div>
                  )}
                  {Object.entries(results).map(([modelId, res]) => (
                    <div key={modelId} className="card p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 capitalize text-lg">
                          {modelId.replace('_', ' ')}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                          Top 3 Probabilities
                        </span>
                      </div>
                      <div className="space-y-2">
                        {res.predictions.map((p, i) => (
                          <ResultBar key={i} label={p.class_name} value={p.confidence} rank={i} />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}