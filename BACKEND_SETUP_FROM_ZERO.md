# Backend Setup — Zero to Fully Running (New PC)

This is the complete, no-assumptions guide to get the **real backend** (FastAPI +
FinBERT), **n8n automation**, and the **already-deployed Vercel frontend** all
talking to each other on a brand-new Windows PC. Follow it top to bottom in order.

> **Big picture of what you're building:**
> ```
> [Vercel: React frontend]  --https-->  [Cloudflare Tunnel]  -->  [Your PC: FastAPI backend :8000]
>                                                                          ^
>                                                                          |
>                                                    [Your PC: n8n :5678] -+  (calls the backend on a schedule)
> ```
> Frontend is already live on Vercel. Nothing below touches that — you're only
> bringing the backend + n8n online and pointing the frontend at them.

---

## PART 0 — What you need installed (one-time, manual installs)

These can't be scripted safely (they need their own installers/admin rights).
Install each, in this order:

### 0.1 Python 3.11 (NOT 3.13/3.14)
- Download: https://www.python.org/downloads/release/python-3110/
- During install: **check "Add python.exe to PATH"**
- Why 3.11 specifically: `torch==2.0.0` (used for the FinBERT model) does not
  ship prebuilt wheels for Python 3.13/3.14 yet — installing on a newer Python
  will fail exactly like the Vercel build did with `torch`. This is why the
  backend must run on 3.11, not whatever "latest Python" you might already have.
- Verify: open a new PowerShell window and run `py -3.11 --version`

### 0.2 Git
- Download: https://git-scm.com/download/win
- Verify: `git --version`

### 0.3 Node.js (LTS, v20+)
- Download: https://nodejs.org/ (only needed if you also want to run the
  frontend locally for dev/testing — not required just to run the backend)
- Verify: `node --version` and `npm --version`

### 0.4 n8n
Two options:
- **Easiest (npx, no install):** just run it when needed —
  ```
  npx n8n
  ```
- **Persistent install:**
  ```
  npm install -g n8n
  n8n start
  ```
Either way it opens at **http://localhost:5678** — create an owner account on
first visit (local account, stays on your PC).

### 0.5 Cloudflare Tunnel (cloudflared)
- Download the Windows installer: https://github.com/cloudflare/cloudflared/releases
  (grab `cloudflared-windows-amd64.exe`, rename to `cloudflared.exe`, put it
  somewhere on your PATH, e.g. `C:\cloudflared\`)
- Verify: `cloudflared --version`

### 0.6 (Optional) PostgreSQL
**Skip this unless you specifically want Postgres.** The backend automatically
falls back to a local SQLite file (`sentiment.db`) if no `DATABASE_URL` is
configured — zero setup, works out of the box, fine for personal/demo use.
Only install Postgres if you want production-grade concurrent DB access.

---

## PART 1 — Get the project onto the new PC

```powershell
# Pick a folder, e.g.
cd C:\Users\Mukul\Projects
git clone https://github.com/mukuld1511-bit/Finance-Sentiment-Analysis.git
cd Finance-Sentiment-Analysis
```

If you don't have the repo pushed yet from the zip I gave you, extract the zip
here instead of cloning, then `git init`, `git remote add origin <repo-url>`,
`git add . && git commit -m "backend + n8n fixes" && git push`.

---

## PART 2 — Run the automated setup script

I've included `setup_backend.ps1` which handles everything scriptable:
venv creation, `pip install -r requirements.txt`, `.env` creation, and finally
starts the server.

```powershell
powershell -ExecutionPolicy Bypass -File setup_backend.ps1
```

**What to expect:**
- `pip install` will take **5–15 minutes** the first time (torch + transformers
  are large downloads, ~1-2 GB total).
- Once it says `Uvicorn running on http://0.0.0.0:8000`, the backend is live.
- The **very first API call** will be slow (30–60s) because FinBERT downloads
  its model weights from Hugging Face on first use, then caches them locally
  (`FINBERT_MODEL_CACHE` in `.env`, default `/app/models` — on Windows this
  resolves relative to the project folder). Every call after that is fast.

**Keep this PowerShell window open** — closing it stops the backend. If you
want it to keep running in the background instead, see Part 6 below.

---

## PART 3 — Verify the backend actually works

Open a **second** PowerShell window (don't close the one running uvicorn) and run:

```powershell
curl http://localhost:8000/api/health
```

Expected response (roughly):
```json
{"status":"healthy","database":"connected","uptime_seconds":12,"model_loaded":"ProsusAI/finbert", ...}
```

If `database` doesn't say `connected`, check your `.env` — either remove the
`DATABASE_URL` line entirely (falls back to SQLite) or make sure Postgres is
actually running if you set one.

Quick test of the actual sentiment model:
```powershell
curl -X POST http://localhost:8000/api/analyze_text -H "Content-Type: application/json" -d '{\"text\":\"Company reports record profit and strong growth\"}'
```
Should return a `POSITIVE` sentiment with a high score.

---

## PART 4 — Expose the backend to the internet (Cloudflare Tunnel)

The Vercel frontend runs on the public internet — it cannot reach
`localhost:8000` on your PC directly. The tunnel gives your local backend a
public HTTPS URL.

**Quick tunnel (temporary URL — good for testing, changes every restart):**
```powershell
cloudflared tunnel --url http://localhost:8000
```
Look for a line like:
```
https://random-words-here.trycloudflare.com
```
That's your public backend URL. Test it: open
`https://random-words-here.trycloudflare.com/api/health` in a browser — same
JSON as before should appear.

**Permanent tunnel (stable URL — needs your own domain in Cloudflare):**
```powershell
cloudflared tunnel login
cloudflared tunnel create sentiment-api
cloudflared tunnel route dns sentiment-api api.yourdomain.com
```
Then create `config.yml` (e.g. in `C:\Users\Mukul\.cloudflared\config.yml`):
```yaml
tunnel: sentiment-api
credentials-file: C:\Users\Mukul\.cloudflared\<tunnel-id>.json
ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```
Run it: `cloudflared tunnel run sentiment-api`
Now `https://api.yourdomain.com` always points at your PC, no URL changes.

**Keep this window open too** — it's a separate process from uvicorn.

---

## PART 5 — Point the Vercel frontend at your backend

1. Go to your Vercel project → **Settings → Environment Variables**
2. Set/update:
   ```
   VITE_API_BASE_URL = https://random-words-here.trycloudflare.com
   ```
   (no trailing slash — use whichever URL you got from Part 4)
3. **Redeploy** — Vite bakes env vars in at *build time*, so just changing the
   variable isn't enough; trigger a new deployment (Vercel dashboard →
   Deployments → ⋯ → Redeploy, or push any commit).
4. Open your Vercel site → it should now show real FinBERT sentiment data
   instead of errors/empty states.

---

## PART 6 — Set up n8n (the daily automation)

1. Start n8n (`npx n8n` or `n8n start`) → open http://localhost:5678
2. **Settings → Variables** → add:
   | Name | Value |
   |---|---|
   | `BACKEND_API_URL` | `https://random-words-here.trycloudflare.com` (same tunnel URL as Part 5, **no trailing slash**) |
   | `BACKEND_API_KEY` | leave blank unless you set `REQUIRE_API_KEY=true` in `.env` |
   | `SLACK_WEBHOOK_URL` | your Slack incoming webhook (create a fresh one — rotate the old leaked one if you haven't already) |
   | `N8N_SUBSCRIBER_WEBHOOK_SECRET` | any long random string — must match the same variable name in the backend's `.env` |

   > These are accessed in the workflow as `$vars.NAME` — **not** `$env.NAME`.
   > `$env` access is blocked by n8n by default; that mismatch was the
   > "access to env vars denied" error you hit earlier. Already fixed in the
   > workflow file — just make sure you import the latest `sentiment-pipeline.json`.

3. **Import the workflow:** n8n → Workflows → Import from File →
   select `workflows/sentiment-pipeline.json`
4. Open the imported workflow → click each `httpRequest` node once to confirm
   the URL field resolves (shouldn't show red/error) → **Execute workflow**
   to test end-to-end manually before relying on the cron schedule.
5. **Activate** the workflow (toggle top-right) so the Mon–Fri 4:30 PM cron
   trigger runs automatically.

---

## PART 7 — Keep everything alive

You now have **3 things that must all stay running** on this PC for the site
to work:
1. `uvicorn` (FastAPI backend) — Part 2's PowerShell window
2. `cloudflared tunnel` — Part 4's PowerShell window
3. `n8n` — Part 6, only needed for the daily automated report (frontend works
   fine without it)

**Practical tips:**
- Disable sleep/hibernate: Settings → System → Power → set "Sleep" to Never
  while this PC is acting as the server.
- If you want these to survive a reboot without manually reopening 3 terminal
  windows, look into **NSSM** (Non-Sucking Service Manager) to register
  `uvicorn`, `cloudflared`, and `n8n` as Windows services — optional, only
  worth it if you're keeping this running long-term unattended.
- If the quick (`trycloudflare.com`) tunnel URL ever changes (e.g. after a
  restart), you must update it in **two** places: Vercel's
  `VITE_API_BASE_URL` (+ redeploy) and n8n's `BACKEND_API_URL` variable. The
  permanent-domain tunnel setup in Part 4 avoids this entirely.

---

## Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| `pip install` fails on `torch` | Wrong Python version | Use Python 3.11 exactly, not 3.12+/3.13+/3.14 |
| Backend starts but `/api/health` hangs on first call | FinBERT downloading model weights | Wait 30-60s, only happens once |
| n8n: "access to env vars denied" | Used `$env.X` instead of `$vars.X` | Re-import the fixed `sentiment-pipeline.json` |
| n8n: `Invalid URL: /api/health` | `BACKEND_API_URL` variable empty/missing | Set it under Settings → Variables |
| Vercel site shows no data / network errors | `VITE_API_BASE_URL` not set, or tunnel not running, or forgot to redeploy after changing the env var | Check Part 5 steps in order |
| Vercel build fails installing `torch` | `.vercelignore` missing or not committed | Confirm `.vercelignore` and `vercel.json` are in the repo root and pushed |
| `database: error` in `/api/health` | `DATABASE_URL` in `.env` points to a Postgres that isn't running | Remove the line from `.env` to fall back to SQLite, or start Postgres |
