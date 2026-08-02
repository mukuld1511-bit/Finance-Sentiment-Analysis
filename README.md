# 📈 AI Stock Market Sentiment Analysis & Trading Signal Engine

> Production-ready, FinBERT-powered financial news sentiment analyzer, database-backed REST API, interactive dashboards, and automated n8n alert pipeline for quantitative trading.

---

## 🌟 Features Overview

- **🤖 FinBERT AI Model Integration**: Leverages HuggingFace's `ProsusAI/finbert` model fine-tuned on financial lexicon for high-precision sentiment classification.
- **📰 Multi-Source News Scraper**: Real-time web scraper covering **Reuters, Bloomberg, CNBC, MarketWatch, Yahoo Finance, and TradingView**. Includes MD5 hash-based article deduplication and anti-bot retry backoff.
- **⚡ Fast RESTful API (FastAPI)**: Serves endpoints for live sentiment scoring, historical trend analysis, top trading signals, backtest results, and automated pipeline triggers.
- **🗄️ Dual-Database Persistence (SQLAlchemy)**: Out-of-the-box support for **PostgreSQL** in production with automatic fallback to local **SQLite** (`sentiment.db`).
- **📊 Dual Dashboard UIs**:
  - **Streamlit Dashboard** (`dashboard.py`): Interactive charts, sentiment gauges, news feed, and signal tables.
  - **Vite + React + TypeScript Web App** (`src/`): Modern dark-mode web application.
- **🔄 Automated n8n Pipeline**: Multi-branch, intelligent n8n workflow for daily cron execution, high-conviction trade alerts, and executive summary reports sent to Slack & Email.

---

## 📁 Repository Structure

```
.
├── app.py                            # FastAPI server & REST API endpoints
├── sentiment_analyzer.py             # FinBERT NLP engine & batch inference
├── news_collector.py                 # Multi-source scraper (Reuters, Bloomberg, etc.)
├── database.py                       # SQLAlchemy engine & session management
├── models.py                         # ORM database models (Articles, Scores, Signals)
├── dashboard.py                      # Streamlit interactive dashboard
├── schema.sql                        # PostgreSQL DDL database schema
├── docker-compose.yml                # Multi-container orchestration config
├── workflows/
│   ├── sentiment-pipeline.json        # n8n Local Workflow (127.0.0.1)
│   └── sentiment-pipeline-docker.json # n8n Docker Production Workflow
├── README.md                         # Main Project Documentation
├── SETUP_AND_RUN.md                  # Comprehensive Step-by-Step Setup Guide
└── N8N_WORKFLOW_GUIDE.md             # Complete n8n Automation Architecture Guide
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
py -3.11 -m pip install -r requirements.txt
npm install
```

### 2. Start FastAPI Backend
```bash
py -3.11 -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. Launch Streamlit Dashboard
```bash
py -3.11 -m streamlit run dashboard.py
```

### 4. Launch React Web UI
```bash
npm run dev
```

### 5. Run n8n Automated Pipeline
Import `workflows/sentiment-pipeline.json` into your local n8n instance (`http://localhost:5678`) and click **Execute Workflow**.

---

## 🚢 Deployment (backend + n8n local, frontend on Vercel)

This project runs the FastAPI backend (`app.py`) and n8n **locally**, exposed to the internet
via a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/),
while the React frontend (`src/`) deploys to **Vercel**.

1. **Backend (local):**
   ```bash
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```
2. **n8n (local):** run on `http://localhost:5678`, import `workflows/sentiment-pipeline.json`,
   then set the required variables under Settings → Variables — see the note block inside
   the workflow JSON for the full list (`BACKEND_API_URL`, `SLACK_WEBHOOK_URL`, etc).
3. **Expose the backend:**
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
   Copy the resulting `https://*.trycloudflare.com` URL (or your permanent tunnel domain).
4. **Frontend on Vercel:** deploy `src/` as a static Vite app —
   Build Command: `vite build`, Output Directory: `dist`, and set the env var
   `VITE_API_BASE_URL` to the tunnel URL from step 3.

All backend routes are served under the **`/api/...`** prefix (matches the frontend's calls).

> ⚠️ Keep the PC awake while it's serving traffic — if it sleeps, the backend and n8n both go down.

---

## 📖 Detailed Guides

- 📘 **[SETUP_AND_RUN.md](./SETUP_AND_RUN.md)** — Step-by-step instructions to run, configure, and troubleshoot the entire stack.
- 📙 **[N8N_WORKFLOW_GUIDE.md](./N8N_WORKFLOW_GUIDE.md)** — In-depth explanation of the n8n automation nodes, branching logic, Slack & Email integrations.
- 📩 **[N8N_SUBSCRIBER_SETUP.md](./N8N_SUBSCRIBER_SETUP.md)** — Wiring the subscribe form to the n8n webhook.

---

## 🛡️ License

MIT License &copy; 2026. Built with Python, PyTorch, HuggingFace, FastAPI, React, and n8n.
