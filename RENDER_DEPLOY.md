# 🚀 Render Deployment Guide

## Step-by-Step Render Deployment

### Step 1: Push to GitHub
Pehle ensure karo ki saari latest files GitHub pe push ho chuki hain:
```bash
git add .
git commit -m "Add Dockerfile and Render deployment config"
git push
```

### Step 2: Create Render Account
1. Open: **https://render.com**
2. **Sign Up with GitHub** (Google se mat karo — GitHub wala option select karo)

### Step 3: Create New Web Service
1. Render Dashboard pe click: **"New +"** → **"Web Service"**
2. **"Connect a repository"** me apna GitHub repo select karo: `mukuld1511-bit/Finance-Sentiment-Analysis`
3. Settings:
   - **Name**: `finance-sentiment-api`
   - **Region**: Oregon (US West) ya Singapore (Closest)
   - **Runtime**: **Docker**
   - **Plan**: **Free** (0$/month)
4. Click **"Create Web Service"**

### Step 4: Wait for Build (5-10 min)
- Render automatically:
  1. Clones your GitHub repo
  2. Builds Docker image from `Dockerfile`
  3. Installs Python dependencies + downloads FinBERT model
  4. Starts Uvicorn server on port 8000
- Build logs live dikhenge screen pe

### Step 5: Get Your Live URL
Build complete hone par Render aapko ek **permanent URL** dega:
```
https://finance-sentiment-api.onrender.com
```

### Step 6: Test Live API
Browser me open karein:
```
https://finance-sentiment-api.onrender.com/health
https://finance-sentiment-api.onrender.com/docs
```

### Step 7: Update n8n Workflow to Hit Render URL
n8n me **Step 1 (Health Check)** aur **Step 2 (Run Pipeline)** nodes me URL update karein:
- Old: `http://127.0.0.1:8000/health`
- New: `https://finance-sentiment-api.onrender.com/health`

- Old: `http://127.0.0.1:8000/run_pipeline`
- New: `https://finance-sentiment-api.onrender.com/run_pipeline`

---

## Important Notes

- **Free Tier Limitation**: Free plan pe server 15 min inactivity ke baad sleep hota hai. Pehla request slow hoga (~30 sec cold start), uske baad fast chalega.
- **Auto Deploy**: Har `git push` pe Render automatically redeploy karega.
- **FinBERT Model**: First build me model download hoga (~500MB), uske baad cached rahega.
