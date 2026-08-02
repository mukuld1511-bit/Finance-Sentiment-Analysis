import React, { useState } from "react";
import { StockData } from "../types";
import { Search, ChevronDown, ChevronUp, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StockScreenerProps {
  stocks: StockData[];
  onSelectTicker: (ticker: string) => void;
  isDarkMode?: boolean;
}

export const StockScreener: React.FC<StockScreenerProps> = ({ stocks, onSelectTicker }) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "BUY") return stock.signal.includes("BUY");
    if (filterType === "SELL") return stock.signal.includes("SELL");
    if (filterType === "HOLD") return stock.signal === "HOLD";
    return true;
  });

  const toggleExpand = (ticker: string) => {
    setExpandedTicker(expandedTicker === ticker ? null : ticker);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-semibold text-black tracking-tight" style={{letterSpacing: '-0.02em'}}>
            Live trading signals
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time quantitative trading signals and live stock price stream.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-0 top-3" />
            <input
              type="text"
              placeholder="Search ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-b border-slate-200 text-black text-xs font-bold pl-6 pr-2 py-2 focus:outline-none focus:border-black w-40 sm:w-56"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-1 text-xs">
            {["ALL", "BUY", "SELL", "HOLD"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  filterType === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Frameless Stock Screener Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest py-3">
              <th className="py-3 px-2">Ticker / Company</th>
              <th className="py-3 px-2">Stock Price ($)</th>
              <th className="py-3 px-2">24h Price Move</th>
              <th className="py-3 px-2">AI Signal</th>
              <th className="py-3 px-2">Sentiment Score</th>
              <th className="py-3 px-2">AI Confidence</th>
              <th className="py-3 px-2">Trend</th>
              <th className="py-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-bold">
            {filteredStocks.map((stock) => {
              const isExpanded = expandedTicker === stock.ticker;
              const isBuy = stock.signal.includes("BUY");
              const isSell = stock.signal.includes("SELL");
              const priceUp = (stock.price_change_pct || 0) >= 0;
              const priceStr = (stock.price || 150).toFixed(2);
              const pctStr = priceUp ? `+${(stock.price_change_pct || 0).toFixed(2)}%` : `${(stock.price_change_pct || 0).toFixed(2)}%`;

              return (
                <React.Fragment key={stock.ticker}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-black">
                          {stock.ticker}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {stock.company_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-2 font-black text-black">
                      ${priceStr}
                    </td>

                    <td className="py-4 px-2">
                      <span className={`flex items-center text-xs font-black ${
                        priceUp ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {priceUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        {pctStr}
                      </span>
                    </td>

                    <td className="py-4 px-2">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        isBuy ? "text-emerald-600" : isSell ? "text-rose-600" : "text-slate-600"
                      }`}>
                        {stock.signal.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-2 font-black text-black">
                      <span className="inline-block transition-transform duration-300">
                        {stock.sentiment_score.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-4 px-2 font-bold text-slate-700">
                      {(stock.confidence * 100).toFixed(0)}%
                    </td>

                    <td className="py-4 px-2">
                      <span className={`flex items-center text-xs ${
                        stock.trend === "IMPROVING" ? "text-emerald-600" : stock.trend === "DECLINING" ? "text-rose-600" : "text-slate-600"
                      }`}>
                        {stock.trend === "IMPROVING" ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        {stock.trend}
                      </span>
                    </td>

                    <td className="py-4 px-2 text-right space-x-3">
                      <button
                        onClick={() => onSelectTicker(stock.ticker)}
                        className="text-xs font-black uppercase tracking-widest text-black hover:text-emerald-600"
                      >
                        Chart
                      </button>
                      <button
                        onClick={() => toggleExpand(stock.ticker)}
                        className="text-slate-400 hover:text-black"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="py-4 px-2">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>FINBERT SUMMARY RATIONALE</span>
                          </span>
                          <p className="text-xs font-medium text-slate-700 leading-relaxed">
                            {stock.articles_summary}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
