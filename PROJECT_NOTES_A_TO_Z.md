# Finance-Sentiment-Analysis — Project Notes (A to Z)

Ye notes tere project ko **samajhne** ke liye hain — kya bana hai, kyun bana hai,
har piece kaise kaam karta hai, aur kaunse concepts seekhne chahiye. Deploy karne
ke liye alag guide already di thi — ye wali sirf **samajhne** (learn karne) ke liye hai.

---

## 1. Project kya hai (One-liner)

Ek system jo **financial news padhta hai, uska sentiment (positive/negative/neutral)
nikalta hai AI model se, aur usse stock trading signals (BUY/SELL/HOLD) banata hai** —
poora automated pipeline ke saath jo roz khud chalta hai aur Slack/Email pe report bhejta hai.

**4 bade hisse hain:**
1. **Backend** (Python/FastAPI) — asli brain, sentiment analysis + API
2. **Frontend** (React/TypeScript) — website jo user dekhta hai
3. **n8n workflow** — automation jo roz pipeline chalata hai
4. **Database** (SQLite/PostgreSQL) — data store karta hai

---

## 2. Tech Stack — kya kis liye use hua

| Layer | Technology | Kaam kya karta hai |
|---|---|---|
| AI Model | **FinBERT** (`ProsusAI/finbert`) | BERT model jo specifically financial text pe train hua hai — normal sentiment models "the stock crashed" ko samajh nahi paate, FinBERT financial language samajhta hai |
| ML Framework | **PyTorch + Transformers (HuggingFace)** | FinBERT ko load/run karne ke liye |
| Backend API | **FastAPI** | Python ka modern web framework — REST API banane ke liye (Flask se fast, auto-documentation deta hai) |
| ORM | **SQLAlchemy** | Python code se database talk karne ka tareeka, bina raw SQL likhe |
| Database | **PostgreSQL** (prod) / **SQLite** (local fallback) | Articles, sentiment scores, signals store karta hai |
| News Scraping | **BeautifulSoup + Requests** | Reuters, Bloomberg, CNBC, etc se news articles nikalta hai |
| Frontend | **React 19 + TypeScript + Vite** | Website ka UI |
| Styling | **Tailwind CSS** | CSS utility classes se fast styling |
| Charts | **Recharts** | Sentiment graphs, trend charts |
| Automation | **n8n** | "IF this then that" style workflow automation tool — cron pe pipeline chalata hai |
| Tunnel | **Cloudflare Tunnel** | Tere local PC ko internet pe expose karta hai bina router config kiye |
| Hosting (frontend) | **Vercel** | Static frontend hosting, free, fast CDN |

---

## 3. Architecture — sab kaise connected hai

```
                     ┌─────────────────────────┐
   User's Browser →  │   Vercel (Frontend)     │
                     │   React + Vite (static) │
                     └───────────┬─────────────┘
                                 │ HTTPS calls to
                                 │ VITE_API_BASE_URL
                                 ▼
                     ┌─────────────────────────┐
                     │   Cloudflare Tunnel      │  ← public HTTPS URL
                     └───────────┬─────────────┘
                                 │ tunnels to localhost:8000
                                 ▼
        ┌────────────────────────────────────────┐
        │         Tera PC (local machine)          │
        │  ┌──────────────┐   ┌─────────────────┐ │
        │  │ FastAPI       │   │  n8n            │ │
        │  │ (app.py)      │◄──┤  (cron trigger) │ │
        │  │ :8000         │   │  :5678          │ │
        │  └──────┬────────┘   └─────────────────┘ │
        │         │                                 │
        │  ┌──────▼────────┐                        │
        │  │ SQLite/Postgres│                        │
        │  └────────────────┘                        │
        └────────────────────────────────────────────┘
```

**Kyun is tarah split kiya:**
- FinBERT model bhaari hai (~400MB+ RAM/CPU chahiye) — free hosting (Vercel/Render free tier)
  pe ye chalana mushkil/slow hai, isliye apne PC pe chalate hain jahan resources hain.
- Frontend static hai (sirf HTML/JS/CSS) — usko Vercel jaisi CDN service pe daalna sasta
  aur fast hai, wahan Python chalane ki zaroorat nahi.
- Cloudflare Tunnel ek "pul" hai jo bina port-forwarding/static-IP ke tere ghar ke PC ko
  internet se safely connect karta hai.

---

## 4. Backend Deep-Dive

### 4.1 `sentiment_analyzer.py` — The AI brain

Ye file **FinBERT** model ko load karti hai aur text ka sentiment nikalti hai:
- `analyze_single(text)` → ek text ka sentiment: POSITIVE/NEGATIVE/NEUTRAL + probability scores
- `analyze_article(article)` → poore article (title + body) ka **weighted score**:
  title ko 40% weight, body ko 60% weight — kyunki title zyada "punch" wala hota hai
  but body mein zyada context hota hai
- Model pehli baar chalne pe HuggingFace se download hota hai (~400MB), fir cache ho jata hai

**Concept to learn:** *Transfer learning* — FinBERT ek pre-trained BERT model hai jo
financial text pe further trained (fine-tuned) hua hai. Tum khud se bina scratch se
train kiye, ready-made intelligence use kar rahe ho.

### 4.2 `news_collector.py` — Data collection

- Alag-alag financial news sites (Reuters, Bloomberg, CNBC, MarketWatch, Yahoo Finance,
  TradingView) se articles scrape karta hai har method jaise `scrape_reuters()`,
  `scrape_bloomberg()` etc.
- `combine_and_deduplicate()` — MD5 hash bana ke duplicate articles hataata hai (agar
  same article do jagah se aaya to sirf ek baar count ho)
- Retry logic — agar request fail ho to 3 baar retry karta hai (1s, 2s, 4s wait ke saath)
  — isse **exponential backoff** kehte hain, ek standard pattern jab external services
  se baat kar rahe ho

### 4.3 `database.py` + `models.py` + `schema.sql`

- `database.py` — DB connection setup. `DATABASE_URL` env var check karta hai; agar
  nahi mila ya Postgres unreachable, **SQLite** pe fallback ho jata hai automatically
- `models.py` — SQLAlchemy **ORM models**: Python classes jo database tables represent
  karti hain (e.g. `ArticleModel`, `SentimentScoreModel`, `TradingSignalModel`,
  `DailyAggregateModel`) — tum Python objects se kaam karte ho, SQL likhna nahi padta
- `schema.sql` — raw SQL version of the same schema (Postgres ke liye), UUID primary
  keys, foreign keys, aur 3 analytical views

**Concept to learn:** *ORM (Object-Relational Mapping)* — database rows ko Python
objects ki tarah treat karna. `db.query(ArticleModel).filter(...)` likhna, SQL nahi.

### 4.4 `app.py` — The API (main file, 900+ lines)

Har endpoint ek specific kaam karta hai:

| Endpoint | Method | Kaam |
|---|---|---|
| `/api/health` | GET | Server zinda hai ya nahi, DB connected hai ya nahi |
| `/api/current_sentiment` | GET | Overall market sentiment (sab tickers ka average) |
| `/api/stock_sentiment` | GET | Ek specific ticker (jaise AAPL) ka sentiment |
| `/api/sentiment_history` | GET | Pichle N din ka sentiment trend |
| `/api/top_signals` | GET | Top BUY ya SELL signals |
| `/api/analyze_text` | POST | Koi bhi custom text do, FinBERT sentiment de |
| `/api/run_pipeline` | POST | **Full automated pipeline** — scrape + analyze + store + signals generate — ye wahi hai jo n8n roz call karta hai |
| `/api/backtesting_results` | GET | Historical performance metrics (accuracy, Sharpe ratio, etc) |
| `/api/subscribe` | POST | Email signup for daily reports |
| `/api/files/{filename}` | GET | Source code explorer feature ke liye (frontend ka "code inspector") |

**Concept to learn:** *REST API design* — GET for reading data, POST for creating/
triggering actions. Har endpoint ek "resource" ya "action" represent karta hai.

**CORS** (`CORSMiddleware`) — browser security feature jo control karta hai ki
konsi websites (origins) tere API ko call kar sakti hain. `allow_origins=["*"]`
matlab koi bhi website call kar sakti hai (development mein theek, production mein
ideally specific domain hi allow karte hain).

**Dependency Injection** (`Depends(get_db)`) — FastAPI ka pattern jisse har request
ko apna khud ka fresh DB connection milta hai, aur request khatam hone pe automatically
close ho jata hai.

---

## 5. Frontend Deep-Dive

### 5.1 Structure
```
src/
├── App.tsx              → Main page, sab components ko jodta hai
├── main.tsx              → Entry point, React ko HTML mein "mount" karta hai
├── lib/api.ts             → apiUrl() helper — VITE_API_BASE_URL + path jodta hai
└── components/
    ├── MarketOverview.tsx      → Overall market sentiment dashboard
    ├── StockScreener.tsx       → Ticker-wise signals table
    ├── SentimentCharts.tsx     → Recharts se graphs
    ├── BacktestingView.tsx     → Historical performance
    ├── TextAnalyzerModal.tsx   → "type your own text, get sentiment" feature
    ├── NewsCollectorView.tsx   → Live news scrape demo
    ├── JoinSignals.tsx         → Email subscribe form
    └── DeliverablesExplorer.tsx→ Source code viewer
```

### 5.2 Key Concept: Build-time vs Run-time env vars
`VITE_API_BASE_URL` ek **build-time** variable hai — Vite isko `vite build` ke
waqt code mein "bake" kar deta hai. Isliye jab bhi Vercel pe ye variable change
karte ho, **redeploy zaroor karna padta hai** — sirf variable change karne se
already-built files update nahi hoti.

### 5.3 SPA (Single Page Application)
Poora website ek hi HTML file load karta hai, fir JavaScript se dynamically
content badalta hai (page reload nahi hota jab tu ek section se dusre pe jata hai).
Isi wajah se `vercel.json` mein sirf `vite build` + static `dist` folder serve
karna kaafi hai.

---

## 6. n8n Automation Deep-Dive

**n8n kya hai:** Visual workflow tool — boxes (nodes) ko lines se jodo, har box
ek action karta hai (API call, condition check, code run, email bhejo, etc).
Zapier/Make jaisa hi hai but self-hosted aur free.

### Tera workflow ka flow:
```
Cron Trigger (Mon-Fri 4:30 PM)
      ↓
Health Check (/api/health)
      ↓
IF healthy? ──No──→ Slack Alert "backend down" (stop)
      ↓ Yes
Run Full Pipeline (/api/run_pipeline) — scrape + FinBERT + DB + signals
      ↓
Process Metrics (JS code) — ranks tickers, builds report text
      ↓
Fetch Subscribers (/api/internal/subscribers)
      ↓
IF High Conviction Signal? ──Yes──→ Urgent Slack Alert
                             ──No───→ Daily Summary Slack Message
      ↓ (dono se)
IF Subscribers > 0? ──Yes──→ Send Email
```

**Concepts to learn:**
- **Cron expression** — `30 16 * * 1-5` matlab "minute 30, hour 16 (4:30 PM),
  har din, har mahina, weekday 1-5 (Mon-Fri)"
- **Webhook** — ek URL jo external service ko call karne deta hai tere system ko
  trigger karne ke liye (jaise `/api/webhook/articles`)
- **n8n Variables vs Environment Variables** — `$vars.NAME` (n8n UI mein set kiye
  gaye) alag hain `$env.NAME` (OS-level, security ke liye n8n mein by default
  **blocked** expressions mein) — ye wahi confusion tha jo "access to env vars
  denied" error de raha tha

---

## 7. Deployment Concepts (jo tune already kiye hain)

| Concept | Kya hai |
|---|---|
| **Static hosting** | Vercel sirf pre-built HTML/CSS/JS files serve karta hai — koi server-side code nahi chalta |
| **Tunnel** | `localhost` ko public internet URL banane ka tareeka bina port-forwarding/static-IP ke |
| **Reverse proxy** (Cloudflare Tunnel is one) | Ek layer jo requests ko internet se tere local server tak forward karti hai |
| **`.vercelignore`** | Vercel ko batata hai kaunse files deployment mein include NAHI karni — humne Python files exclude ki taaki Vercel torch install na kare |
| **CORS** | Backend ko batana hoga ki frontend (alag domain se) usse baat kar sakta hai |

---

## 8. Glossary — Quick reference

- **API** — Application Programming Interface, do systems ke beech baat karne ka
  contract (yahan: frontend ↔ backend REST API se baat karte hain)
- **REST** — API design style jo HTTP methods (GET/POST/PUT/DELETE) aur URLs use
  karta hai resources access karne ke liye
- **ORM** — code se database tak, bina raw SQL likhe
- **Sentiment Analysis** — text padh ke uska emotional tone (positive/negative)
  nikalna, ML model se
- **BERT** — Google ka language model architecture jo text ko "samajhta" hai
  (Bidirectional Encoder Representations from Transformers)
- **Fine-tuning** — pehle se trained model ko ek specific domain (yahan: finance)
  ke data pe thoda aur train karna
- **Webhook** — URL jo automatically call hoti hai jab koi event hota hai
- **Cron job** — scheduled task jo fixed time pe automatically chalta hai
- **CORS** — browser security jo control karta hai konsi domains API call kar sakti hain
- **Env var (environment variable)** — configuration values (URLs, secrets, keys)
  jo code ke bahar rakhte hain taaki code hardcode na ho aur secrets leak na ho
- **SPA** — Single Page Application, ek hi baar load hoke JS se sab kuch dynamically dikhata hai
- **Build-time vs Run-time** — build-time = jab code compile/bundle hota hai (Vite
  build), run-time = jab actual user browser mein chal raha hota hai

---

## 9. Agar aur seekhna hai — suggested order

1. **FastAPI basics** — official docs (fastapi.tiangolo.com) — routes, Pydantic
   models, dependency injection
2. **SQLAlchemy ORM** — basic queries, relationships, sessions
3. **HuggingFace Transformers** — kaise koi bhi pre-trained model load/use karte
   hain (`pipeline()` function se start karo)
4. **React + Hooks** — `useState`, `useEffect` — tera frontend inhi pe based hai
5. **n8n** — unka official "n8n Academy" free hai, tere jaisa hi practical use-case
   cover karta hai
6. **HTTP fundamentals** — status codes, headers, methods — sab kuch inhi pe based hai

---

*Ye notes tere apne project ke actual code se banaye gaye hain — jo bhi confuse
lage, us specific file/function ka naam leke pooch sakta hai, main detail mein
explain kar dunga.*
