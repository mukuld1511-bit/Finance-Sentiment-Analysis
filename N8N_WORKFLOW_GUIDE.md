# 🔄 n8n Automated Pipeline Architecture & User Guide

This guide explains how the **n8n Automated Sentiment Pipeline** works step-by-step, including node functions, branching logic, and alert configurations.

---

## 🏗️ Workflow Diagram Overview

```
[Cron Trigger] ──> [Step 1: Health Check] ──> [Step 2: Scrape & FinBERT Pipeline]
                                                     │
                                                     ▼
                                          [Step 3: Compute Quant Metrics]
                                                     │
                                                     ▼
                                     [Step 4: IF High Conviction?]
                                        /                        \
                        (True: High Conviction)         (False: Normal Day)
                                     /                              \
       [Branch A: Send URGENT Alert (Slack)]       [Branch B: Daily Summary (Slack)]
                                     \                              /
                                      └──> [Email Dispatcher Node] ┘
```

---

## 📌 Node-by-Node Working Explanation

### 1. **Cron Trigger (Mon-Fri 4:30 PM EST)**
- **Type**: `n8n-nodes-base.cron`
- **Schedule**: Every weekday at 4:30 PM EST (US Stock Market Close).
- **Function**: Automatically initiates the daily analysis run.

### 2. **Step 1: Health Check API**
- **Type**: `n8n-nodes-base.httpRequest`
- **URL**: `http://127.0.0.1:8000/health`
- **Function**: Pings the FastAPI backend. Verifies that the server, database connection, and FinBERT model are active before proceeding.

### 3. **Step 2: Scrape News + FinBERT Analysis + Store DB**
- **Type**: `n8n-nodes-base.httpRequest` (`POST`)
- **URL**: `http://127.0.0.1:8000/run_pipeline`
- **Payload**: `{"tickers": ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOGL", "META", "INTC"]}`
- **Function**:
  1. Triggers live scraping across **6 news outlets**.
  2. Runs FinBERT sentiment classification.
  3. Deduplicates and stores articles and scores in the database.
  4. Generates daily aggregates and trading signals.
  5. Calculates Kelly-inspired portfolio allocation weights.

### 4. **Step 3: Process & Compute Quant Metrics**
- **Type**: `n8n-nodes-base.code` (JavaScript)
- **Function**:
  - Maps tickers to full company names (e.g. `NVDA` $\rightarrow$ `NVIDIA Corporation`).
  - Classifies **Market Regime** (`BULLISH_EXPANSION`, `BEARISH_DOWNTURN`, `BALANCED`).
  - Identifies **#1 Top Pick of the Day**.
  - Formats two distinct outputs:
    1. `slack_message`: Markdown formatted for Slack with emojis, badges, and 24h price movement forecasts.
    2. `email_html`: Styled HTML email with KPI summary cards, progress bars, and beginner legend.
    3. `urgent_message`: Breaking news text for high-conviction trades.

### 5. **Step 4: IF High Conviction Opportunity? (Smart Decision Router)**
- **Type**: `n8n-nodes-base.if`
- **Condition**: Checks if `is_high_conviction_alert` is `true`.
- **Logic**:
  - **TRUE**: If a stock shows a `STRONG_BUY` or `STRONG_SELL` with high AI confidence, routes to **Branch A**.
  - **FALSE**: Otherwise, routes to **Branch B**.

### 6. **Branch A: Send URGENT High-Conviction Alert**
- **Type**: `n8n-nodes-base.httpRequest` (`POST`)
- **URL**: Slack Webhook URL
- **Function**: Dispatches an instant **URGENT BREAKING TRADING ALERT** to Slack.

### 7. **Branch B: Post Daily Summary Report (Slack)**
- **Type**: `n8n-nodes-base.httpRequest` (`POST`)
- **URL**: Slack Webhook URL
- **Function**: Dispatches the routine **Daily Market Summary & Portfolio Breakdown** to Slack.

### 8. **Email Dispatcher Node**
- **Type**: `n8n-nodes-base.emailSend`
- **Function**: Binds to `email_html` and sends executive HTML email summaries.

---

## 📥 How to Import & Run in n8n

1. Open your local n8n instance in your browser: `http://localhost:5678`.
2. Click **Workflows** on the left menu.
3. Click `...` (top right) $\rightarrow$ **Import from File**.
4. Choose `workflows/sentiment-pipeline.json`.
5. Click **Execute Workflow** at the bottom to test!
