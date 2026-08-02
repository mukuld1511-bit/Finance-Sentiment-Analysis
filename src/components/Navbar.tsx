import React from "react";
import { Moon, RefreshCw, Sun } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLiveAutoRefresh: boolean;
  setIsLiveAutoRefresh: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  lastUpdated?: string;
}

const tabs = [
  { id: "dashboard",      label: "Dashboard" },
  { id: "text-analyzer",  label: "FinBERT Classifier" },
  { id: "news-collector", label: "News Collector" },
  { id: "deliverables",   label: "Deliverables" },
  { id: "backtesting",    label: "Backtesting" },
  { id: "about",          label: "About" },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  isLiveAutoRefresh,
  setIsLiveAutoRefresh,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: isDarkMode ? "rgba(10,16,32,0.74)" : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        borderBottom: isDarkMode ? "1px solid rgba(148,163,184,0.13)" : "1px solid rgba(15,23,42,0.06)",
        boxShadow: isDarkMode ? "0 6px 24px rgba(0,0,0,0.12)" : "0 1px 0 rgba(15,23,42,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-4">

          {/* ── Logo ── */}
          <div aria-hidden />

          {/* ── Center Nav Pills ── */}
          <nav className={`hidden md:flex items-center gap-0.5 rounded-2xl border p-1 ${isDarkMode ? "border-slate-700/80 bg-slate-800/70" : "border-white/80 bg-slate-100/75"}`}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all"
                  style={{
                    color: isActive ? (isDarkMode ? "#f8fafc" : "#0f172a") : (isDarkMode ? "#94a3b8" : "#64748b"),
                    background: isActive ? (isDarkMode ? "#334155" : "#ffffff") : "transparent",
                    boxShadow: isActive ? (isDarkMode ? "0 2px 8px rgba(0,0,0,0.2)" : "0 1px 4px rgba(15,23,42,0.09)") : "none",
                    transition: "all 0.18s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${isDarkMode ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700" : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"}`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Live dot toggle */}
            <button
              onClick={() => setIsLiveAutoRefresh(!isLiveAutoRefresh)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
              style={{
                borderColor: isLiveAutoRefresh ? "rgba(16,185,129,0.3)" : "rgba(0,0,0,0.1)",
                background: isLiveAutoRefresh ? "rgba(16,185,129,0.07)" : "transparent",
                color: isLiveAutoRefresh ? "#059669" : "#94a3b8",
              }}
            >
              {isLiveAutoRefresh ? "Live" : "Paused"}
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #374151 100%)",
                boxShadow: "0 2px 12px rgba(30,41,59,0.2)",
                transition: "box-shadow 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(30,41,59,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(30,41,59,0.2)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Syncing" : "Refresh"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
