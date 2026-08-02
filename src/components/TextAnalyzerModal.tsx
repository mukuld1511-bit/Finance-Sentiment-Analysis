import React, { useState } from "react";
import { TextAnalysisResult } from "../types";
import { Cpu, Play, Sparkles, Clock, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { apiUrl } from "../lib/api";

export const TextAnalyzerModal: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    "NVIDIA announced groundbreaking new AI chip architecture exceeding Q2 analyst revenue targets, driving strong institutional buy ratings across Wall Street."
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<TextAnalysisResult | null>({
    text: "NVIDIA announced groundbreaking new AI chip architecture...",
    sentiment_label: "POSITIVE",
    sentiment_score: 0.91,
    confidence: 0.96,
    probabilities: {
      POSITIVE: 0.91,
      NEGATIVE: 0.03,
      NEUTRAL: 0.06
    },
    explanation: "FinBERT transformer classified strong bullish growth signals.",
    processing_time_ms: 18
  });

  const sampleHeadlines = [
    "NVIDIA announces next-gen AI supercomputing chips, crushing revenue targets.",
    "Intel reports foundry market share loss and restructuring expenses, stock drops 5%.",
    "Tesla EV margin pressures offset by Robotaxi autonomous regulatory approvals.",
    "Apple Services revenue hits all-time record, driving Wall Street price upgrades.",
    "Federal Reserve holds interest rates steady as inflation trends toward 2% target."
  ];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch(apiUrl("/api/analyze_text"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Text analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="surface-panel bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            FinBERT Real-Time Financial News Sentiment Classifier
          </h2>
          <p className="text-xs text-slate-400">
            ProsusAI/finbert transformer model evaluation engine (Title = 40%, Body = 60% weighted score)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input & Samples */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Enter Financial News Text or Headline
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste financial news paragraph or headline here..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Length: {inputText.length} chars</span>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating FinBERT...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Analyze Sentiment</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Sample Headlines */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              ⚡ Quick Preset Headlines (Click to test):
            </span>
            <div className="space-y-1.5">
              {sampleHeadlines.map((headline, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(headline)}
                  className="w-full text-left p-2 bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-800 transition-colors line-clamp-1"
                >
                  "{headline}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Prediction Output Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Classification Result</span>
              </span>

              {result && (
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{result.processing_time_ms} ms</span>
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-5">
                {/* Sentiment Label & Score Gauge */}
                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Sentiment Classification</span>
                    <span
                      className={`text-2xl font-black ${
                        result.sentiment_label === "POSITIVE"
                          ? "text-emerald-400"
                          : result.sentiment_label === "NEGATIVE"
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {result.sentiment_label}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Composite Score</span>
                    <span className="text-2xl font-mono font-bold text-white">
                      {(result.sentiment_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Class Probabilities Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Class Probabilities Distribution</span>
                    <span className="font-mono">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {/* POSITIVE */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Positive (Bullish)</span>
                      <span className="font-mono text-emerald-400">
                        {((result.probabilities.POSITIVE || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(result.probabilities.POSITIVE || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* NEUTRAL */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Neutral</span>
                      <span className="font-mono text-amber-400">
                        {((result.probabilities.NEUTRAL || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(result.probabilities.NEUTRAL || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* NEGATIVE */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Negative (Bearish)</span>
                      <span className="font-mono text-rose-400">
                        {((result.probabilities.NEGATIVE || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(result.probabilities.NEGATIVE || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                {result.explanation && (
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400 block mb-0.5">Model Reasoner Insight:</span>
                    <span>{result.explanation}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                Click "Analyze Sentiment" to view FinBERT classification results.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Model: ProsusAI/finbert</span>
            <span>Batch Size: 50-100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
