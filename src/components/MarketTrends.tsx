import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Globe2, MapPin, Newspaper, TrendingUp } from "lucide-react";

type Market = "india" | "world";

const marketData = {
  india: {
    label: "India",
    note: "Domestic indices, sectors and market-moving headlines.",
    indices: [
      ["NIFTY 50", "24,890.45", "+0.62%", true],
      ["SENSEX", "81,256.14", "+0.54%", true],
      ["NIFTY BANK", "53,118.20", "-0.18%", false],
    ],
    themes: ["IT earnings momentum", "Private banks", "Defence & rail capex"],
    headlines: ["Foreign flows return to large-cap financials", "Rupee and crude remain key risk monitors"],
  },
  world: {
    label: "World",
    note: "Global benchmarks and cross-market risk signals.",
    indices: [
      ["S&P 500", "6,312.89", "+0.31%", true],
      ["NASDAQ", "20,884.71", "+0.68%", true],
      ["DOW JONES", "44,314.20", "-0.12%", false],
    ],
    themes: ["AI infrastructure", "US rate outlook", "Energy supply risk"],
    headlines: ["Semiconductors lead global risk-on session", "Treasury yields steady ahead of macro data"],
  },
} as const;

export const MarketTrends: React.FC = () => {
  const [market, setMarket] = useState<Market>("india");
  const data = marketData[market];

  return (
    <section className="surface-panel rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Market trends</p>
          <h2 className="google-display mt-2 text-3xl font-medium tracking-tight text-slate-900">A clearer view of market momentum.</h2>
          <p className="mt-2 text-sm text-slate-500">{data.note}</p>
        </div>
        <div className="flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-medium">
          <button onClick={() => setMarket("india")} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${market === "india" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><MapPin className="h-3.5 w-3.5" />India</button>
          <button onClick={() => setMarket("world")} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${market === "world" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Globe2 className="h-3.5 w-3.5" />World</button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {data.indices.map(([name, value, change, positive]) => (
          <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500">{name}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="text-2xl font-semibold tracking-tight text-slate-900">{value}</span>
              <span className={`flex items-center text-xs font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>{positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><TrendingUp className="h-4 w-4 text-emerald-500" />Themes in focus</div>
          <div className="mt-4 flex flex-wrap gap-2">{data.themes.map((theme) => <span key={theme} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">{theme}</span>)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Newspaper className="h-4 w-4 text-indigo-500" />What’s moving the tape</div>
          <div className="mt-3 space-y-3">{data.headlines.map((headline) => <p key={headline} className="border-l-2 border-indigo-200 pl-3 text-sm leading-relaxed text-slate-600">{headline}</p>)}</div>
        </div>
      </div>
    </section>
  );
};
