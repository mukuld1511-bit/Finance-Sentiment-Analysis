import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { MarketOverview } from "./components/MarketOverview";
import { SentimentCharts } from "./components/SentimentCharts";
import { StockScreener } from "./components/StockScreener";
import { TextAnalyzerModal } from "./components/TextAnalyzerModal";
import { NewsCollectorView } from "./components/NewsCollectorView";
import { DeliverablesExplorer } from "./components/DeliverablesExplorer";
import { BacktestingView } from "./components/BacktestingView";
import { ParticleBackground } from "./components/ParticleBackground";
import { AboutView } from "./components/AboutView";
import { MarketTrends } from "./components/MarketTrends";
import { HomeAbout } from "./components/HomeAbout";
import { JoinSignals } from "./components/JoinSignals";
import { apiUrl } from "./lib/api";
import { MarketOverviewData, StockData, SentimentHistoryPoint } from "./types";

const DEFAULT_STOCKS: StockData[] = [
  { ticker: "NVDA", company_name: "NVIDIA Corporation", sector: "Semiconductors", sentiment_score: 0.89, confidence: 0.96, signal: "STRONG_BUY", trend: "IMPROVING", num_articles: 42, price: 128.80, price_change_pct: 4.16, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Unprecedented demand for Next-Gen Blackwell GPUs." },
  { ticker: "AAPL", company_name: "Apple Inc.", sector: "Consumer Electronics", sentiment_score: 0.78, confidence: 0.91, signal: "BUY", trend: "IMPROVING", num_articles: 28, price: 224.50, price_change_pct: 2.80, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Record services revenue growth and strategic AI integration." },
  { ticker: "MSFT", company_name: "Microsoft Corporation", sector: "Enterprise Software", sentiment_score: 0.82, confidence: 0.89, signal: "BUY", trend: "IMPROVING", num_articles: 31, price: 448.20, price_change_pct: 2.10, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Azure cloud revenue acceleration and Copilot monetization." },
  { ticker: "META", company_name: "Meta Platforms, Inc.", sector: "Communication Services", sentiment_score: 0.81, confidence: 0.88, signal: "BUY", trend: "IMPROVING", num_articles: 24, price: 495.10, price_change_pct: 1.65, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Ad targeting efficiency and Llama AI ecosystem growth." },
  { ticker: "AMZN", company_name: "Amazon.com, Inc.", sector: "E-Commerce & Cloud", sentiment_score: 0.76, confidence: 0.85, signal: "BUY", trend: "STABLE", num_articles: 22, price: 186.40, price_change_pct: 1.95, price_direction: "UP", sentiment_direction: "UP", articles_summary: "AWS cloud growth re-acceleration." },
  { ticker: "GOOGL", company_name: "Alphabet Inc.", sector: "Communication Services", sentiment_score: 0.71, confidence: 0.82, signal: "BUY", trend: "IMPROVING", num_articles: 26, price: 172.90, price_change_pct: 1.80, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Gemini 3 model deployment across Search and Google Cloud." },
  { ticker: "TSLA", company_name: "Tesla, Inc.", sector: "Automotive", sentiment_score: 0.44, confidence: 0.72, signal: "HOLD", trend: "STABLE", num_articles: 35, price: 218.30, price_change_pct: -0.20, price_direction: "DOWN", sentiment_direction: "FLAT", articles_summary: "EV price discounting and margin pressures offset by Robotaxi progress." },
  { ticker: "INTC", company_name: "Intel Corporation", sector: "Semiconductors", sentiment_score: 0.32, confidence: 0.84, signal: "SELL", trend: "DECLINING", num_articles: 19, price: 21.40, price_change_pct: -1.80, price_direction: "DOWN", sentiment_direction: "DOWN", articles_summary: "Foundry division losses and market share erosion." },
  { ticker: "RELIANCE.NS", company_name: "Reliance Industries", sector: "Conglomerate / Energy", sentiment_score: 0.80, confidence: 0.90, signal: "BUY", trend: "IMPROVING", num_articles: 21, price: 2945.60, price_change_pct: 2.35, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Jio and retail arm expansion driving strong quarterly growth." },
  { ticker: "TCS.NS", company_name: "Tata Consultancy Services", sector: "IT Services", sentiment_score: 0.75, confidence: 0.87, signal: "BUY", trend: "STABLE", num_articles: 17, price: 4120.30, price_change_pct: 1.40, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Strong deal pipeline and AI services demand from global clients." },
  { ticker: "INFY.NS", company_name: "Infosys", sector: "IT Services", sentiment_score: 0.72, confidence: 0.85, signal: "BUY", trend: "IMPROVING", num_articles: 15, price: 1845.90, price_change_pct: 1.10, price_direction: "UP", sentiment_direction: "UP", articles_summary: "Digital transformation deals and margin expansion outlook." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveAutoRefresh, setIsLiveAutoRefresh] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem("estime-theme") === "dark");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [marketOverview, setMarketOverview] = useState<MarketOverviewData | null>(null);
  const [stockSignals, setStockSignals] = useState<StockData[]>(DEFAULT_STOCKS);
  const [selectedTicker, setSelectedTicker] = useState<string>("NVDA");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [historyData, setHistoryData] = useState<SentimentHistoryPoint[]>([]);

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    localStorage.setItem("estime-theme", isDarkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  // 10s API polling
  useEffect(() => {
    if (!isLiveAutoRefresh) return;
    const interval = setInterval(() => fetchAllData(true), 10000);
    return () => clearInterval(interval);
  }, [isLiveAutoRefresh, selectedTicker, timeRange]);

  // 3s live price + sentiment tick
  useEffect(() => {
    if (!isLiveAutoRefresh) return;
    const tickInterval = setInterval(() => {
      setStockSignals((prev) =>
        prev.map((s) => {
          const pDelta = (Math.random() - 0.48) * 0.35;
          const sDelta = (Math.random() - 0.48) * 0.008;
          const newPrice = Math.max(1, Math.round(((s.price || 150) + pDelta) * 100) / 100);
          const newSent = Math.min(0.99, Math.max(0.01, Math.round((s.sentiment_score + sDelta) * 1000) / 1000));
          const newPct = Math.round(((s.price_change_pct || 0) + pDelta * 0.05) * 100) / 100;
          return {
            ...s,
            price: newPrice,
            sentiment_score: newSent,
            price_change_pct: newPct,
            price_direction: pDelta >= 0 ? "UP" : "DOWN",
            sentiment_direction: sDelta >= 0 ? "UP" : "DOWN",
            last_updated: new Date().toLocaleTimeString(),
          };
        })
      );
    }, 3000);
    return () => clearInterval(tickInterval);
  }, [isLiveAutoRefresh]);

  useEffect(() => { fetchStockHistory(selectedTicker, timeRange); }, [selectedTicker, timeRange]);

  const fetchAllData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [overRes, buyRes, sellRes] = await Promise.all([
        fetch(apiUrl("/api/current_sentiment")),
        fetch(apiUrl("/api/top_signals?type=BUY")),
        fetch(apiUrl("/api/top_signals?type=SELL")),
      ]);
      const overData = await overRes.json();
      setMarketOverview(overData);
      const buyData = await buyRes.json();
      const sellData = await sellRes.json();
      const apiSignals: StockData[] = [...(buyData.signals || []), ...(sellData.signals || [])];
      if (apiSignals.length > 0) {
        setStockSignals((prev) =>
          apiSignals.map((s) => {
            const ex = prev.find((p) => p.ticker === s.ticker);
            return { ...s, price: ex?.price ?? (s as any).price ?? 150, price_change_pct: ex?.price_change_pct ?? 2.5, price_direction: ex?.price_direction ?? "UP", sentiment_direction: ex?.sentiment_direction ?? "UP" };
          })
        );
      }
      await fetchStockHistory(selectedTicker, timeRange);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      /* keep local data */
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const fetchStockHistory = async (ticker: string, range: string) => {
    const days = { "24h": 1, "7d": 7, "30d": 30 }[range] ?? 7;
    try {
      const res = await fetch(apiUrl(`/api/sentiment_history?ticker=${ticker}&days=${days}`));
      const d = await res.json();
      setHistoryData(d.history || []);
    } catch { /* ignore */ }
  };

  return (
    <div className={`app-theme relative min-h-screen text-slate-900 ${isDarkMode ? "theme-dark" : ""}`} style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Floating dots — Antigravity signature */}
      <ParticleBackground isDarkMode={isDarkMode} />

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefresh={() => fetchAllData(false)}
          isRefreshing={isRefreshing}
          isLiveAutoRefresh={isLiveAutoRefresh}
          setIsLiveAutoRefresh={setIsLiveAutoRefresh}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          lastUpdated={lastUpdated}
        />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 space-y-24">
          {activeTab === "dashboard" && (
            <>
              <MarketOverview data={marketOverview} stocks={stockSignals} />
              <MarketTrends />
              <SentimentCharts
                historyData={historyData}
                selectedTicker={selectedTicker}
                onTickerChange={setSelectedTicker}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
              />
              <StockScreener
                stocks={stockSignals}
                onSelectTicker={(t) => { setSelectedTicker(t); window.scrollTo({ top: 500, behavior: "smooth" }); }}
              />
              <JoinSignals />
              <HomeAbout />
            </>
          )}
          {activeTab === "text-analyzer" && <TextAnalyzerModal />}
          {activeTab === "news-collector" && <NewsCollectorView />}
          {activeTab === "deliverables" && <DeliverablesExplorer />}
          {activeTab === "backtesting" && <BacktestingView />}
          {activeTab === "about" && <AboutView />}
        </main>

        <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
          <p className="font-medium text-slate-500">Estime &bull; Real-time Market Intelligence</p>
          <p className="mt-1">FinBERT Inference &bull; Live Price Stream &bull; n8n Automation</p>
        </footer>
      </div>
    </div>
  );
}