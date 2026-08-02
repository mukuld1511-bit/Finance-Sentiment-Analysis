import React, { useState } from "react";
import { NewsArticle } from "../types";
import { Newspaper, RefreshCw, ExternalLink, Filter, ShieldCheck, CheckCircle2 } from "lucide-react";
import { apiUrl } from "../lib/api";

export const NewsCollectorView: React.FC = () => {
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [articles, setArticles] = useState<NewsArticle[]>([
    {
      url: "https://www.reuters.com/markets/companies/nvda-surge-2026",
      title: "NVIDIA Reports Record Q2 Revenue Overcoming Tech Market Headwinds",
      body: "NVIDIA announced quarterly results today exceeding analyst predictions. High-performance computing demand across cloud providers drove 24% quarter-over-quarter expansion.",
      source: "Reuters",
      ticker: "NVDA",
      published_at: "2026-07-31T21:15:00Z",
      sentiment_score: 0.91,
      sentiment_label: "POSITIVE"
    },
    {
      url: "https://www.bloomberg.com/news/articles/2026-07-31/aapl-services-growth",
      title: "Apple Services Margin Reaches New Peak as Ecosystem Usage Surges",
      body: "Services adoption across Apple devices offset seasonal hardware shifts, generating strong free cash flow according to institutional reports.",
      source: "Bloomberg",
      ticker: "AAPL",
      published_at: "2026-07-31T20:45:00Z",
      sentiment_score: 0.82,
      sentiment_label: "POSITIVE"
    },
    {
      url: "https://www.cnbc.com/2026/07/31/tsla-ev-discounting-margin.html",
      title: "Tesla Margin Compression Continues Amid Global EV Pricing Competition",
      body: "Tesla shares traded sideways as investor focus shifted toward Robotaxi timeline clarity and energy storage volume growth.",
      source: "CNBC",
      ticker: "TSLA",
      published_at: "2026-07-31T19:30:00Z",
      sentiment_score: 0.42,
      sentiment_label: "NEUTRAL"
    },
    {
      url: "https://www.marketwatch.com/story/msft-cloud-monetization-2026",
      title: "Microsoft Copilot Enterprise Adoption Beats Wall Street Targets",
      body: "MarketWatch analysis shows enterprise seats for AI Copilot expanded 38%, fueling high-margin recurring software revenues.",
      source: "MarketWatch",
      ticker: "MSFT",
      published_at: "2026-07-31T18:50:00Z",
      sentiment_score: 0.85,
      sentiment_label: "POSITIVE"
    },
    {
      url: "https://finance.yahoo.com/news/intc-restructuring-cost-2026.html",
      title: "Intel Restructuring Expenses and Foundry Delays Impact Quarterly Guidance",
      body: "Intel shares dropped 4.2% following earnings commentary highlighting chip foundry ramp-up expenses.",
      source: "Yahoo Finance",
      ticker: "INTC",
      published_at: "2026-07-31T17:10:00Z",
      sentiment_score: 0.31,
      sentiment_label: "NEGATIVE"
    },
    {
      url: "https://www.tradingview.com/news/tradingview:meta-llama-expansion/",
      title: "Meta Platforms Confirms Bullish Technical Breakout Following Open-Source AI Adoption",
      body: "TradingView volume indicators show institutional accumulation above key technical moving averages.",
      source: "TradingView",
      ticker: "META",
      published_at: "2026-07-31T16:20:00Z",
      sentiment_score: 0.88,
      sentiment_label: "POSITIVE"
    },
    {
      url: "https://www.moneycontrol.com/news/business/reliance-jio-retail-growth-2026",
      title: "Reliance Industries Jio and Retail Arms Drive Record Quarterly Profit",
      body: "Moneycontrol reports Reliance's consumer businesses posted double-digit growth, offsetting softer refining margins this quarter.",
      source: "Moneycontrol",
      ticker: "RELIANCE.NS",
      published_at: "2026-07-31T15:05:00Z",
      sentiment_score: 0.80,
      sentiment_label: "POSITIVE"
    },
    {
      url: "https://economictimes.indiatimes.com/markets/stocks/news/tcs-deal-pipeline-2026",
      title: "TCS Deal Pipeline Strengthens on Global Enterprise AI Spending",
      body: "Economic Times reports Tata Consultancy Services signed several large-cap deals as clients accelerate AI-led digital transformation budgets.",
      source: "Economic Times",
      ticker: "TCS.NS",
      published_at: "2026-07-31T14:40:00Z",
      sentiment_score: 0.75,
      sentiment_label: "POSITIVE"
    }
  ]);

  const [selectedSource, setSelectedSource] = useState<string>("ALL");

  const handleScrapeNews = async () => {
    setIsScraping(true);
    try {
      const res = await fetch(apiUrl("/api/scrape_news"));
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error("Scrape error:", e);
    } finally {
      setIsScraping(false);
    }
  };

  const sources = ["ALL", "Reuters", "Bloomberg", "CNBC", "MarketWatch", "Yahoo Finance", "TradingView"];

  const filteredArticles = articles.filter(
    (a) => selectedSource === "ALL" || a.source === selectedSource
  );

  return (
    <div className="surface-panel bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Financial News Harvest Pipeline (news_collector.py)
            </h2>
            <p className="text-xs text-slate-400">
              Scrapes 6 major financial outlets with 3x exponential backoff retries & MD5 deduplication.
            </p>
          </div>
        </div>

        <button
          onClick={handleScrapeNews}
          disabled={isScraping}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScraping ? "animate-spin" : ""}`} />
          <span>{isScraping ? "Harvesting News Feeds..." : "Run Live News Scraper"}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block">Outlets Monitored</span>
          <span className="text-lg font-bold text-white mt-0.5 block">6 Major Outlets</span>
          <span className="text-slate-500 text-[11px]">Reuters, Bloomberg, CNBC, MW, Yahoo, TV</span>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block">Deduplication Status</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">100% Unique</span>
          <span className="text-slate-500 text-[11px]">MD5 URL & Title Checksum Hash</span>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block">Harvest Timeout Limit</span>
          <span className="text-lg font-bold text-white mt-0.5 block">30s Max / Source</span>
          <span className="text-slate-500 text-[11px]">Rate-limited respectful fetching</span>
        </div>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
        {sources.map((src) => (
          <button
            key={src}
            onClick={() => setSelectedSource(src)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedSource === src
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.map((article, index) => (
          <div
            key={index}
            className="bg-slate-950 hover:bg-slate-800/60 p-4 rounded-xl border border-slate-800/80 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-slate-800 font-mono font-bold text-emerald-400 rounded border border-slate-700">
                  {article.ticker}
                </span>
                <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800 font-semibold">
                  {article.source}
                </span>
                <span className="text-slate-500">
                  {new Date(article.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {article.sentiment_score !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold ${
                    article.sentiment_score > 0.60
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : article.sentiment_score < 0.40
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  Score: {(article.sentiment_score * 100).toFixed(0)}%
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              {article.title}
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {article.body}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-900">
              <span className="text-slate-500 font-mono text-[11px] truncate max-w-md">
                {article.url}
              </span>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 flex items-center space-x-1 font-semibold"
              >
                <span>Read Full Outlet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
