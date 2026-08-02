import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { SentimentHistoryPoint } from "../types";

interface SentimentChartsProps {
  historyData: SentimentHistoryPoint[];
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  isDarkMode?: boolean;
}

export const SentimentCharts: React.FC<SentimentChartsProps> = ({
  historyData,
  selectedTicker,
  onTickerChange,
  timeRange,
  setTimeRange,
}) => {
  const tickerList = ["NVDA", "AAPL", "MSFT", "META", "AMZN", "GOOGL", "TSLA", "INTC", "RELIANCE.NS", "TCS.NS", "INFY.NS"];

  const pieData = [
    { name: "Positive (Bullish)", value: 62.5, color: "#10B981" },
    { name: "Neutral", value: 25.0, color: "#F59E0B" },
    { name: "Negative (Bearish)", value: 12.5, color: "#EF4444" },
  ];

  const sectorData = [
    { sector: "Semiconductors", sentiment: 89 },
    { sector: "Software", sentiment: 82 },
    { sector: "Cloud Infra", sentiment: 79 },
    { sector: "E-Commerce", sentiment: 76 },
    { sector: "Automotive", sentiment: 44 },
  ];

  const scatterData = [
    { ticker: "NVDA", sentiment: 0.89, returnPct: 8.4, volume: 45 },
    { ticker: "MSFT", sentiment: 0.82, returnPct: 4.2, volume: 28 },
    { ticker: "META", sentiment: 0.81, returnPct: 5.1, volume: 22 },
    { ticker: "AAPL", sentiment: 0.78, returnPct: 3.8, volume: 35 },
    { ticker: "AMZN", sentiment: 0.76, returnPct: 2.9, volume: 30 },
    { ticker: "GOOGL", sentiment: 0.71, returnPct: 3.1, volume: 25 },
    { ticker: "TSLA", sentiment: 0.44, returnPct: -1.2, volume: 40 },
    { ticker: "INTC", sentiment: 0.32, returnPct: -5.4, volume: 18 },
    { ticker: "RELIANCE.NS", sentiment: 0.80, returnPct: 2.35, volume: 20 },
    { ticker: "TCS.NS", sentiment: 0.75, returnPct: 1.40, volume: 14 },
    { ticker: "INFY.NS", sentiment: 0.72, returnPct: 1.10, volume: 12 },
  ];

  return (
    <div className="space-y-12">
      {/* 2-Column Grid: Time-Series + Pie Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Chart 1: Time Series */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 tracking-tight" style={{letterSpacing: '-0.02em'}}>
                {selectedTicker} Sentiment Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Weighted FinBERT article classification score over time
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Ticker Selector */}
              <select
                value={selectedTicker}
                onChange={(e) => onTickerChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-slate-900"
              >
                {tickerList.map((t) => (
                  <option key={t} value={t}>
                    {t} Ticker
                  </option>
                ))}
              </select>

              {/* Time Range Selector */}
              <div className="flex space-x-1 text-xs font-extrabold bg-slate-50 p-1 rounded-xl border border-slate-200">
                {["24h", "7d", "30d"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      timeRange === r
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 1]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <ReferenceLine y={0.6} stroke="#10B981" strokeDasharray="3 3" label={{ value: "BUY (0.60)", fill: "#10B981", fontSize: 10, fontWeight: "bold" }} />
                <ReferenceLine y={0.4} stroke="#EF4444" strokeDasharray="3 3" label={{ value: "SELL (0.40)", fill: "#EF4444", fontSize: 10, fontWeight: "bold" }} />
                <Line
                  type="monotone"
                  dataKey="avg_sentiment"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie Distribution */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight" style={{letterSpacing: '-0.02em'}}>
              Market Sentiment Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Today's classified news proportions
            </p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 text-xs font-bold">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="text-slate-900 font-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Sector Bar Chart + Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
        {/* Sector Bar Chart */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight" style={{letterSpacing: '-0.02em'}}>
              Sector Sentiment Rankings
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Average bullish rating per industry sector
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis dataKey="sector" type="category" stroke="#475569" fontSize={10} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <Bar dataKey="sentiment" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Correlation Plot */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight" style={{letterSpacing: '-0.02em'}}>
              Sentiment vs 5-day Return (%)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              FinBERT rating vs asset price delta
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" dataKey="sentiment" name="Sentiment" domain={[0.2, 1.0]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis type="number" dataKey="returnPct" name="Return %" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <ZAxis type="number" dataKey="volume" range={[60, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <Scatter name="Stocks" data={scatterData} fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
