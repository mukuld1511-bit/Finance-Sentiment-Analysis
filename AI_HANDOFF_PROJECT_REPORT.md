# Estime — Complete AI Handoff & Project Status Report

**Repository:** `mukuld1511-bit/Finance-Sentiment-Analysis`  
**Current branch:** `main`  
**Latest local commit:** `1628f56 Configure Render API and Vercel frontend deployment`  
**Report purpose:** Give another AI or developer enough technical and product context to safely continue the project without rereading the entire repository.

---

## 1. Product summary

Estime is a financial-market intelligence product. Its main web experience combines a FinBERT-style news sentiment classifier, live/mocked trading signals, market trend views, a source-code explorer, backtesting metrics, and email signal registration.

The intended product journey is:

1. A visitor opens the Estime dashboard.
2. They review market sentiment, stock signals, charts, and separate India/World trend panels.
3. They can run an ad-hoc financial-news sentiment classification.
4. They can join the “signal list” with an email address and India/World market preferences.
5. n8n reads registered subscribers and sends scheduled market-signal emails.

The repository contains **two backend generations**:

- The current product web app is **React + Vite + Express/TypeScript** (`src/`, `server.ts`) and is the one targeted for Render/Vercel.
- A legacy/parallel research pipeline is **Python + FastAPI + FinBERT + Streamlit** (`app.py`, `news_collector.py`, `sentiment_analyzer.py`, `dashboard.py`). It is still valuable for the ML/news pipeline and now has initial India-market support.

Do not assume both backend API namespaces are interchangeable. The Express app uses `/api/...`; FastAPI uses root paths such as `/health` and `/run_pipeline`.

---

## 2. Technology stack

| Area | Technology |
|---|---|
| Web UI | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| UI/charting | Lucide icons, Recharts, Motion |
| Current web server | Express 4 in `server.ts` |
| AI proxy | Google GenAI SDK; uses Gemini only when `GEMINI_API_KEY` is configured |
| Research API | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Sentiment engine | HuggingFace `ProsusAI/finbert`, PyTorch, Transformers |
| Python analytics UI | Streamlit, Plotly, Pandas |
| Local persistence | `sentiment.db` for Python; `data/subscribers.json` for web subscribers |
| Automation | n8n workflow JSON under `workflows/` |
| Planned hosting | Render for Express API; Vercel for static Vite frontend |

---

## 3. Repository map

| Path | Role |
|---|---|
| `src/App.tsx` | React application orchestration, data polling, route-like tab state, theme state |
| `src/components/Navbar.tsx` | Minimal centered tab navigation, refresh/live controls, light/dark switcher |
| `src/components/MarketOverview.tsx` | Home hero, live ticker strip, hero branding, stats |
| `src/components/MarketTrends.tsx` | India/World market-trend switcher; currently presentation/mock data |
| `src/components/JoinSignals.tsx` | Main-page subscriber registration form |
| `src/components/AboutView.tsx` | About page and secondary email subscription form |
| `src/components/HomeAbout.tsx` | Home page brand/about section |
| `src/components/TextAnalyzerModal.tsx` | Financial-news classification UI |
| `src/components/NewsCollectorView.tsx` | News scraper UI |
| `src/components/DeliverablesExplorer.tsx` | Source-file browser/downloader |
| `src/components/BacktestingView.tsx` | Backtest metrics UI |
| `src/lib/api.ts` | Frontend API origin helper (`VITE_API_BASE_URL`) |
| `src/index.css` | Global typography, full-screen ambient gradients, light/dark panel styling |
| `server.ts` | Current Express API, mock market data, Gemini fallback and subscriber automation endpoints |
| `app.py` | Python FastAPI sentiment pipeline and database handling |
| `news_collector.py` | Python global + India market news collection helpers |
| `sentiment_analyzer.py` | Python FinBERT analysis logic |
| `dashboard.py` | Streamlit dashboard |
| `workflows/sentiment-pipeline.json` | n8n daily signal workflow |
| `render.yaml` | Render Blueprint for Express/Node API deployment |
| `vercel.json` | Vercel Vite static frontend configuration |
| `.env.example` | Environment variable template; contains no actual secrets |
| `N8N_SUBSCRIBER_SETUP.md` | Local, non-Docker subscriber/n8n setup notes |

---

## 4. Current web UI state

### Design

- Full-screen ambient gradient and particle backdrop.
- Google Sans Text/Google Sans Display typography loaded through `index.html`.
- Estime is deliberately **not shown in the navbar**; the hero contains the large bold product name.
- Light/dark mode is user-toggleable and persisted in browser local storage (`estime-theme`).
- All formerly dark utility panels have a common `surface-panel` treatment so both themes remain readable.

### Navigation tabs

1. Dashboard
2. FinBERT Classifier
3. News Collector
4. Deliverables
5. Backtesting
6. About

### Home/dashboard sections

1. Live ticker strip
2. Large Estime hero: “Signal before the market moves.”
3. India/World Market Trends switcher
4. Sentiment trajectory, distribution, sector, and scatter charts
5. Live trading-signal screener
6. Join Estime Signals registration card
7. Home About section

### Important UI limitation

The India/World Market Trends card is currently **curated static presentation data**. It is not yet fed by the Python collection/database pipeline or a dedicated Express endpoint. Do not describe it as live until that API link is added.

---

## 5. Current Express API (`server.ts`)

All endpoints are under `/api`.

| Endpoint | Method | Purpose |
|---|---:|---|
| `/api/health` | GET | Health, uptime, processed article count, model label |
| `/api/current_sentiment` | GET | Aggregate sentiment from current mock stock database |
| `/api/stock_sentiment?ticker=...` | GET | Signal for one ticker; returns a mock fallback for unknown ticker |
| `/api/sentiment_history?ticker=...&days=...` | GET | Generated sentiment history |
| `/api/top_signals?type=BUY` | GET | Filtered signal list |
| `/api/analyze_text` | POST | Gemini analysis if configured, otherwise keyword heuristic fallback |
| `/api/scrape_news` | GET | Returns sample financial-news articles |
| `/api/webhook/articles` | POST | Increments processed article counter for inbound article batches |
| `/api/subscribe` | POST | Public subscriber registration endpoint |
| `/api/internal/subscribers` | GET | Protected subscriber list for n8n only |
| `/api/backtesting_results` | GET | Fixed illustrative backtesting metrics |
| `/api/files/:filename` | GET | Allow-listed file export for Deliverables page |

### Subscriber contract

`POST /api/subscribe` accepts:

```json
{
  "name": "Optional display name",
  "email": "user@example.com",
  "markets": ["india", "world"]
}
```

Behavior:

- Validates email format.
- Deduplicates by normalized lowercase email.
- Saves subscribers in `data/subscribers.json`.
- Ignores invalid market preferences; allowed values are only `india` and `world`.
- Optionally posts `{ event: "subscriber.created", subscriber: ... }` to `N8N_SUBSCRIBER_WEBHOOK_URL`.
- Adds `X-Subscriber-Secret` when `N8N_SUBSCRIBER_WEBHOOK_SECRET` is configured.

`GET /api/internal/subscribers` requires this header:

```text
X-Subscriber-Secret: <N8N_SUBSCRIBER_WEBHOOK_SECRET>
```

It returns:

```json
{
  "subscribers": [
    {
      "email": "user@example.com",
      "name": "Optional display name",
      "markets": ["india", "world"],
      "subscribed_at": "ISO-8601 date",
      "source": "website"
    }
  ]
}
```

The internal endpoint intentionally returns `401 Unauthorized` in a normal browser without the header. This is expected and protects subscriber email addresses.

### CORS

`server.ts` adds CORS headers for `CLIENT_ORIGIN`, falling back to `*`. For production, set `CLIENT_ORIGIN` to the deployed Vercel domain instead of leaving a permissive wildcard.

---

## 6. n8n subscriber automation

### Workflow file

`workflows/sentiment-pipeline.json`

### Updated workflow path

```text
Cron Trigger
  → Step 1: Health Check API
  → Step 2: Scrape News + FinBERT Pipeline
  → Step 3: Process Quant Metrics
  → Step 3A: Fetch Signal Subscribers
  → Step 3B: Attach Subscriber Recipients
  → Step 4: IF High Conviction?
  → Slack branch
  → Step 5: Email Recipients Available?
  → Email Dispatcher
```

### Subscriber nodes

**Step 3A: Fetch Signal Subscribers**

- HTTP GET to `http://127.0.0.1:3000/api/internal/subscribers`.
- Requires `X-Subscriber-Secret` header.
- Includes timeout `15000 ms`.
- Retries 3 times with 2 seconds between attempts.
- For a local n8n process and local Express server, `127.0.0.1:3000` is correct.
- For n8n Cloud or another machine, this must become a publicly accessible HTTPS API URL.

**Step 3B: Attach Subscriber Recipients**

- Reads `subscribers` from Step 3A.
- Deduplicates email addresses.
- Attaches `subscriber_emails` and `subscriber_count` to the signal report.

**Step 5: Email Recipients Available?**

- Prevents an email-send attempt when no subscribers are registered.
- The **true** output must be connected to `Email Dispatcher Node` in the n8n canvas.

### Observed verification status

The user provided an n8n execution screenshot where Step 3A, Step 3B, Step 4, and Step 5 were green. Therefore, fetching and attaching subscribers worked in the local environment. The Email Dispatcher node originally appeared unexecuted/unconnected; the user later indicated the connection was completed. Re-run a full workflow and verify the Email Dispatcher turns green before calling email automation fully verified.

### Required local secret setup

`.env` must have a real secret, for example:

```env
N8N_SUBSCRIBER_WEBHOOK_SECRET=<long-random-value>
N8N_SUBSCRIBER_WEBHOOK_URL=http://localhost:5678/webhook/signal-subscriber
```

Use that exact same secret as Step 3A’s `X-Subscriber-Secret` header. Restart `npm run dev` after changing `.env`.

Never commit `.env` or `data/subscribers.json`. Both are ignored by `.gitignore`.

---

## 7. Python/FastAPI/FinBERT pipeline

### Original role

The Python system is a separate research and analysis service that can:

- collect financial news;
- run FinBERT classification;
- store data in SQLite/PostgreSQL via SQLAlchemy;
- generate aggregate signals;
- provide FastAPI endpoints;
- expose a Streamlit dashboard.

### FastAPI endpoints

| Endpoint | Method | Role |
|---|---:|---|
| `/health` | GET | Health check |
| `/current_sentiment` | GET | Aggregate market sentiment |
| `/stock_sentiment` | GET | Ticker signal |
| `/sentiment_history` | GET | Historical ticker sentiment |
| `/top_signals` | GET | Filtered signals |
| `/analyze_text` | POST | FinBERT analysis |
| `/webhook/articles` | POST | Article ingestion |
| `/backtesting_results` | GET | Backtest figures |
| `/run_pipeline` | POST | Full collection + FinBERT + DB pipeline |

### India-market additions made

`news_collector.py` now defines:

```python
INDIA_TICKERS = [
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS",
  "INFY.NS", "ICICIBANK.NS", "BHARTIARTL.NS"
]
```

Changes:

- Python default ticker universe now combines major US and India tickers.
- `app.py` seed data includes the six NSE companies above.
- The default `/run_pipeline` request now includes these NSE tickers.
- Bloomberg symbol construction uses `:IN` for `.NS`/`.BO` tickers and `:US` otherwise.
- India-only methods `scrape_moneycontrol()` and `scrape_economic_times()` add India-market context/fallback articles.
- Existing global collector behavior remains available for US tickers.

### Important Python caveats

1. A number of collector sources intentionally return fallback/demo content when scraping is unavailable. Do not claim all sources are production-grade live scraping.
2. Moneycontrol/Economic Times integrations currently provide India-specific fallback/context articles and URLs; they are not robust parser implementations yet.
3. The Streamlit dashboard has not been fully redesigned for India/World separation.
4. Local Python command validation was blocked in this Codex environment by a permission-denied `uv` trampoline. TypeScript validation did run successfully. A developer should run local Python checks before production use:

```powershell
py -3.11 -m py_compile app.py news_collector.py sentiment_analyzer.py dashboard.py
py -3.11 -m uvicorn app:app --host 127.0.0.1 --port 8000
```

---

## 8. Local development

### Current web product

```powershell
npm install
npm run dev
```

This runs Express + Vite middleware on `http://127.0.0.1:3000`.

Useful checks:

```powershell
npm run lint
npm run build
```

### Python service

```powershell
py -3.11 -m pip install -r requirements.txt
py -3.11 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
py -3.11 -m streamlit run dashboard.py
```

### Local n8n without Docker

1. Keep `npm run dev` running at port 3000.
2. Run/open n8n at `http://localhost:5678`.
3. Import `workflows/sentiment-pipeline.json`.
4. Paste the configured subscriber secret into Step 3A’s request header.
5. Execute Step 3A first, then the full workflow.

---

## 9. Deployment architecture (Render + Vercel)

### Intended setup

```text
Vercel (Vite static frontend)
   │  VITE_API_BASE_URL=https://<render-service>.onrender.com
   ▼
Render (Express API in server.ts)
   │
   ├── Gemini API (optional)
   └── n8n webhook (optional)
```

### Render configuration

`render.yaml` now uses the current Node/Express application:

- Runtime: Node
- Build: `npm ci && npm run build`
- Start: `npm start`
- Health check: `/api/health`
- Environment variables expected:
  - `NODE_ENV=production`
  - `N8N_SUBSCRIBER_WEBHOOK_SECRET` — generated/set in Render
  - `GEMINI_API_KEY` — optional; set manually in Render
  - `CLIENT_ORIGIN` — set to final Vercel URL

### Vercel configuration

`vercel.json` builds the Vite static output from `dist`.

Required Vercel environment variable:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

This must be set in Vercel **before** its production deployment. The value is compiled into the frontend.

### Deployment status at report time

- Deployment configuration is committed locally in `1628f56`.
- The commit has **not been pushed** to GitHub at report time because explicit approval is required before exporting source code and triggering external deployments.
- Render/Vercel UI automation was unavailable in this Codex session because the local browser controller hit a Windows permissions failure. This does not invalidate the configuration files.
- Before deploying, verify `npm run build` locally; an earlier production build passed before the most recent deployment wiring changes, and `npm run lint` passed after the wiring changes.

### Manual deployment checklist

1. Push commit `1628f56` to GitHub after confirming export authorization.
2. In Render, create/sync Blueprint from repository and confirm service name `estime-signals-api`.
3. Copy the Render public URL.
4. In Vercel, import the same GitHub repository.
5. Add `VITE_API_BASE_URL=<Render URL>` to Vercel Production environment variables.
6. Add `CLIENT_ORIGIN=<Vercel URL>` to Render environment variables.
7. Redeploy Render after setting `CLIENT_ORIGIN`; redeploy Vercel after setting `VITE_API_BASE_URL`.
8. Test `GET <Render URL>/api/health`.
9. Test Vercel dashboard data, text analysis, subscriber registration, and n8n subscriber fetch.

### Production persistence warning

The current subscriber store is a local JSON file (`data/subscribers.json`). Render free instances may use ephemeral filesystems. For a real production mailing list, migrate subscribers to a durable store such as Supabase/Postgres, Render PostgreSQL, or an n8n Data Store/Google Sheet. Until then, subscribers may disappear after a service restart/redeploy.

---

## 10. Environment variables

| Variable | Used by | Required? | Meaning |
|---|---|---:|---|
| `GEMINI_API_KEY` | Express API | Optional | Enables Gemini analysis instead of heuristic fallback |
| `N8N_SUBSCRIBER_WEBHOOK_URL` | Express API | Optional | n8n webhook called after new subscription |
| `N8N_SUBSCRIBER_WEBHOOK_SECRET` | Express + n8n | Required for protected subscriber fetch | Shared secret for n8n/internal subscriber access |
| `CLIENT_ORIGIN` | Express API | Required in production | Final Vercel URL for CORS |
| `VITE_API_BASE_URL` | Vercel frontend | Required in production | Render API URL |
| `DATABASE_URL` | Python service | Optional | PostgreSQL connection; defaults to SQLite |
| `API_KEY`, `REQUIRE_API_KEY` | Python service | Optional | FastAPI API-key behavior |

Secrets must never be placed in `VITE_*` variables except public values. Anything prefixed `VITE_` becomes visible in browser JavaScript.

---

## 11. Validation and quality status

| Check | Status | Notes |
|---|---|---|
| `npm run lint` | Passed | Passed after adding Vite env typing |
| n8n workflow JSON parse | Passed | `ConvertFrom-Json` completed successfully |
| Earlier `npm run build` | Passed | Build passed before the last deployment URL wiring change |
| Latest production build | Not re-run | Codex usage limit prevented elevated build execution |
| Python syntax compile | Not verified in this environment | Python launcher permission issue, not a source-level failure |
| n8n Step 3A/3B/5 | Observed successful | User screenshot showed green completed nodes |

---

## 12. Known issues, risks, and next priorities

### Highest priority

1. **Deploy/push the latest commit** and set Render/Vercel environment variables.
2. **Move subscribers to durable storage** before inviting real users.
3. **Confirm end-to-end n8n email dispatch** with a real subscribed test email.
4. **Rotate any exposed secrets/webhooks** if they were pasted into screenshots, chat, or committed workflow files.

### Architecture improvements

1. Unify or intentionally separate Express and FastAPI. At present they overlap in domain but are different APIs and deployment paths.
2. Replace Express mock market data with data from the Python pipeline or another trusted market-data provider.
3. Implement reliable parsers/RSS/API feeds for Moneycontrol, Economic Times, NSE/BSE, and international sources.
4. Add India index support (`NIFTY 50`, `SENSEX`, `NIFTY BANK`) as first-class aggregate records rather than only NSE equity tickers.
5. Add a user-facing unsubscribe endpoint and include unsubscribe links in n8n emails.
6. Add rate limiting/CAPTCHA or email verification to prevent abuse of the public subscription endpoint.
7. Add automated tests for `/api/subscribe`, secret authorization, API-base deployment mode, and workflow payload handling.

### Security notes

- Never expose `/api/internal/subscribers` publicly without secret validation.
- Do not expose subscriber emails in frontend code or logs.
- Do not hard-code production Slack URLs or SMTP credentials in workflow JSON. The legacy workflow contains Slack webhook URLs and should be reviewed/rotated before sharing publicly.
- Restrict `CLIENT_ORIGIN` in production rather than using `*`.

---

## 13. Suggested next prompt for another AI

> Read `AI_HANDOFF_PROJECT_REPORT.md` first. Continue Estime from the latest commit. Do not remove the existing React/Express application. First make subscriber storage durable with Postgres/Supabase, add unsubscribe handling, and verify the n8n Email Dispatcher end-to-end. Then connect the India/World Market Trends UI to real API data and consolidate the mock Express data with the Python FinBERT pipeline. Preserve the current premium minimal design, with large Estime branding only in the hero and no app name in the navbar.

