export interface StockData {
  ticker: string;
  company_name: string;
  sector: string;
  sentiment_score: number;
  confidence: number;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  num_articles: number;
  articles_summary: string;
  last_updated?: string;
  price?: number;
  price_change_pct?: number;
  price_direction?: 'UP' | 'DOWN' | 'FLAT';
  sentiment_direction?: 'UP' | 'DOWN' | 'FLAT';
}

export interface SentimentHistoryPoint {
  date: string;
  sentiment: number;
  num_articles: number;
  signal: string;
}

export interface MarketOverviewData {
  market_sentiment: number;
  num_bullish: number;
  num_bearish: number;
  num_neutral: number;
  market_direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  last_updated: string;
}

export interface TextAnalysisResult {
  text: string;
  sentiment_label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentiment_score: number;
  confidence: number;
  probabilities: {
    POSITIVE: number;
    NEGATIVE: number;
    NEUTRAL: number;
  };
  explanation?: string;
  processing_time_ms: number;
}

export interface NewsArticle {
  url: string;
  title: string;
  body: string;
  source: string;
  ticker: string;
  published_at: string;
  sentiment_score?: number;
  sentiment_label?: string;
}

export interface BacktestResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  sharpe_ratio: number;
  max_drawdown: number;
  benchmark_return_sp500: number;
  sentiment_strategy_return: number;
  win_rate_percentage: number;
  total_trades_analyzed: number;
  evaluation_period: string;
}

export interface DeliverableFile {
  key: string;
  name: string;
  type: string;
  description: string;
  filename: string;
}
