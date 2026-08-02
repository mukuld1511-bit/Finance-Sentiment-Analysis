import React, { useState, useEffect } from "react";
import { Code2, Copy, Download, Check, FileText, Server, Database, Container, Workflow } from "lucide-react";
import { apiUrl } from "../lib/api";

export const DeliverablesExplorer: React.FC = () => {
  const fileItems = [
    { key: "news_collector.py", label: "news_collector.py", type: "Python Module", icon: FileText, desc: "News scraping engine across 6 outlets with deduplication & exponential backoff" },
    { key: "sentiment_analyzer.py", label: "sentiment_analyzer.py", type: "FinBERT Engine", icon: FileText, desc: "ProsusAI/finbert transformer model evaluation with 40% title / 60% body weighting" },
    { key: "app.py", label: "app.py", type: "FastAPI Backend", icon: Server, desc: "FastAPI REST server with 8 endpoints, CORS, background tasks & SQLAlchemy" },
    { key: "dashboard.py", label: "dashboard.py", type: "Streamlit UI", icon: Server, desc: "Interactive Streamlit analytics dashboard with Plotly charts and signal tables" },
    { key: "schema.sql", label: "schema.sql", type: "PostgreSQL DDL", icon: Database, desc: "PostgreSQL database schema definitions, indexes, constraints & analytical views" },
    { key: "Dockerfile", label: "Dockerfile", type: "Docker Build", icon: Container, desc: "Production Python 3.10 slim container build with health check endpoint" },
    { key: "docker-compose.yml", label: "docker-compose.yml", type: "Orchestration", icon: Container, desc: "Docker Compose multi-service orchestration for FastAPI, PostgreSQL, and n8n" },
    { key: "sentiment-pipeline.json", label: "workflows/sentiment-pipeline.json", type: "n8n Workflow", icon: Workflow, desc: "Complete daily weekday automation workflow with email and Slack alerts" },
    { key: "requirements.txt", label: "requirements.txt", type: "Dependencies", icon: FileText, desc: "Python dependency manifest (PyTorch, Transformers, FastAPI, Streamlit, etc.)" },
    { key: ".env.example", label: ".env.example", type: "Configuration", icon: FileText, desc: "Environment variable template for database, API keys, and email/Slack credentials" },
  ];

  const [activeFile, setActiveFile] = useState<string>("news_collector.py");
  const [fileContent, setFileContent] = useState<string>("// Loading deliverable source code...");
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchFile(activeFile);
  }, [activeFile]);

  const fetchFile = async (filename: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/files/${filename}`));
      const data = await res.json();
      if (data.content) {
        setFileContent(data.content);
      } else {
        setFileContent(`// Error loading ${filename}`);
      }
    } catch (err) {
      setFileContent(`// Error fetching ${filename}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.replace("workflows/", "");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="surface-panel bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Deliverables & Source Code Inspector (8 Complete Files)
            </h2>
            <p className="text-xs text-slate-400">
              Inspect, copy, or download production-ready Python, Docker, SQL, and n8n deliverables.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar File List */}
        <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
            Production Deliverables
          </span>

          {fileItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFile === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveFile(item.key)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start space-x-2.5 ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 border border-slate-700 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <div className="truncate">
                  <div className="font-mono text-slate-200 truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.type}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">{activeFile}</span>
            <span>UTF-8</span>
          </div>

          <div className="p-4 overflow-x-auto max-h-[500px]">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 text-xs">Loading file contents...</div>
            ) : (
              <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre font-normal">
                <code>{fileContent}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
