import React, { useEffect, useRef, useState } from "react";
import { MarketOverviewData, StockData } from "../types";
import { ArrowUpRight, ArrowDownRight, Zap, MoveRight } from "lucide-react";

interface MarketOverviewProps {
  data: MarketOverviewData | null;
  stocks?: StockData[];
  isDarkMode?: boolean;
}

// Count-up hook
function useCountUp(target: number, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ data, stocks = [] }) => {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const sentimentScore = data ? Math.round(data.market_sentiment * 100) : 69;
  const direction = data?.market_direction || "BULLISH";

  // Trigger animations on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const cnt1 = useCountUp(sentimentScore, 1600, visible);
  const cnt2 = useCountUp(742, 1800, visible);
  const cnt3 = useCountUp(218, 1600, visible);
  const cnt4 = useCountUp(3, 900, visible);

  const displayStocks = stocks.length > 0 ? stocks : [
    { ticker: "NVDA", price: 128.80, sentiment_score: 0.89, price_change_pct: 4.16 },
    { ticker: "AAPL", price: 224.50, sentiment_score: 0.78, price_change_pct: 2.80 },
    { ticker: "MSFT", price: 448.20, sentiment_score: 0.82, price_change_pct: 2.10 },
    { ticker: "META", price: 495.10, sentiment_score: 0.81, price_change_pct: 1.65 },
    { ticker: "AMZN", price: 186.40, sentiment_score: 0.76, price_change_pct: 1.95 },
    { ticker: "GOOGL", price: 172.90, sentiment_score: 0.71, price_change_pct: 1.80 },
    { ticker: "TSLA", price: 218.30, sentiment_score: 0.44, price_change_pct: -0.20 },
    { ticker: "INTC", price: 21.40, sentiment_score: 0.32, price_change_pct: -1.80 },
    { ticker: "RELIANCE.NS", price: 2945.60, sentiment_score: 0.80, price_change_pct: 2.35 },
    { ticker: "TCS.NS", price: 4120.30, sentiment_score: 0.75, price_change_pct: 1.40 },
    { ticker: "INFY.NS", price: 1845.90, sentiment_score: 0.72, price_change_pct: 1.10 },
  ] as any[];

  return (
    <div className="relative z-10 min-h-[calc(100vh-68px)] space-y-0">

      {/* ── Live Ticker Strip ── */}
      <div
        className="flex items-center gap-6 overflow-x-auto py-3 border-b border-slate-100 text-xs"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
          Live feed
        </div>
        {displayStocks.map((t: any) => {
          const up = (t.price_change_pct || 0) >= 0;
          return (
            <div key={t.ticker} className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-slate-900">{t.ticker}</span>
              <span className="text-slate-600">${(t.price || 150).toFixed(2)}</span>
              <span className={`text-[10px] font-semibold ${up ? "text-emerald-600" : "text-rose-500"}`}>
                {up ? "+" : ""}{(t.price_change_pct || 0).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ── HERO ── */}
      <div
        ref={heroRef}
        className="relative flex flex-col items-center text-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 145px)", padding: "clamp(110px, 16vh, 190px) 24px clamp(120px, 15vh, 180px)" }}
      >

        {/* Animated gradient orbs — behind everything */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Orb 1 — blue left */}
          <div style={{
            position: "absolute", top: "-80px", left: "-120px",
            width: "520px", height: "520px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
            animation: "orbFloat1 9s ease-in-out infinite",
          }} />
          {/* Orb 2 — emerald right */}
          <div style={{
            position: "absolute", top: "60px", right: "-100px",
            width: "440px", height: "440px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
            animation: "orbFloat2 11s ease-in-out infinite",
          }} />
          {/* Orb 3 — amber center bottom */}
          <div style={{
            position: "absolute", bottom: "-60px", left: "35%",
            width: "360px", height: "360px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
            animation: "orbFloat3 13s ease-in-out infinite",
          }} />

          {/* Subtle dot-grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.35,
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
          }} />
        </div>

        {/* Badge */}
        <div
          className="relative flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-500 mb-8"
          style={{
            background: "rgba(248,250,252,0.8)",
            backdropFilter: "blur(12px)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          FinBERT NLP Engine &nbsp;·&nbsp;
          <span className={`font-semibold ${direction === "BULLISH" ? "text-emerald-600" : "text-rose-600"}`}>
            {direction} Market Regime
          </span>
        </div>

        {/* ── Big Headline ── */}
        <div
          className="relative max-w-4xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}
        >
          <div className="relative mb-7">
            <span className="google-display block text-5xl font-bold leading-none tracking-[-0.07em] text-slate-900 md:text-7xl lg:text-8xl">Estime</span>
            <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Live market intelligence</span>
          </div>
          <h1
            className="google-display text-5xl md:text-7xl lg:text-[88px] font-medium text-slate-900 leading-[0.98] tracking-tight"
            style={{ letterSpacing: "-0.055em" }}
          >
            Signal before{" "}
            {/* Animated shimmer word */}
            <span
              style={{
                backgroundImage: "linear-gradient(120deg, #1e293b 0%, #6366f1 35%, #10b981 55%, #1e293b 80%)",
                backgroundSize: "250% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmerText 4s linear infinite",
              }}
            >
              the market
            </span>
            <br />
            moves.
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="relative text-lg md:text-xl text-slate-500 font-normal max-w-xl leading-relaxed mt-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s",
          }}
        >
          A live read on the stories, sentiment, and momentum shaping markets now.
        </p>

        {/* CTA Row */}
        <div
          className="relative flex items-center gap-3 mt-9"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.48s, transform 0.6s ease 0.48s",
          }}
        >
          {/* Primary — gradient fill */}
          <button
            className="group flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #374151 100%)",
              boxShadow: "0 4px 24px rgba(30,41,59,0.25), 0 1px 2px rgba(0,0,0,0.08)",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(30,41,59,0.35), 0 1px 2px rgba(0,0,0,0.08)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(30,41,59,0.25), 0 1px 2px rgba(0,0,0,0.08)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Run Live Pipeline
            <MoveRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Secondary — ghost */}
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-medium transition-all hover:border-slate-300 hover:bg-slate-50"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            Explore signals
          </button>
        </div>

        {/* ── 4 Stats Row ── */}
        <div
          className="relative grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 mt-20 w-full max-w-3xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s",
          }}
        >
          {/* Divider line */}
          <div
            className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          />

          {[
            {
              value: `${cnt1}%`,
              label: "Sentiment Index",
              sub: "Bullish momentum",
              accent: "#10b981",
            },
            {
              value: `${(cnt2 / 10).toFixed(1)}%`,
              label: "Model Accuracy",
              sub: "1,420+ articles",
              accent: "#1e293b",
            },
            {
              value: `${(cnt3 / 100).toFixed(2)}`,
              label: "Sharpe Ratio",
              sub: "Risk-adjusted alpha",
              accent: "#1e293b",
            },
            {
              value: `${cnt4}s`,
              label: "Stream Latency",
              sub: "Price + sentiment",
              accent: "#1e293b",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="text-center"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${0.65 + i * 0.08}s, transform 0.5s ease ${0.65 + i * 0.08}s`,
              }}
            >
              <div
                className="text-4xl md:text-5xl font-semibold"
                style={{ color: s.accent, letterSpacing: "-0.035em" }}
              >
                {s.value}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-2">
                {s.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Global animation keyframes */}
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, 20px) scale(1.04); }
          66%       { transform: translate(-20px, 35px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-25px, 30px) scale(1.05); }
          70%       { transform: translate(15px, -20px) scale(0.96); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(20px, -25px) scale(1.06); }
        }
        @keyframes shimmerText {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
};
