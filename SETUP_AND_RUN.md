# 🛠️ Complete Setup & Execution Guide

This document provides a step-by-step walkthrough to run, test, and deploy every component of the **Stock Market Sentiment Analysis & Trading Signal Engine**.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Configuration (.env)](#2-environment-configuration-env)
3. [Running the FastAPI Backend Server](#3-running-the-fastapi-backend-server)
4. [Running the Streamlit Dashboard](#4-running-the-streamlit-dashboard)
5. [Running the React Web Application](#5-running-the-react-web-application)
6. [API Endpoints Overview](#6-api-endpoints-overview)
7. [Running with Docker Compose](#7-running-with-docker-compose)
8. [Troubleshooting & Common Fixes](#8-troubleshooting--common-fixes)

---

## 1. Prerequisites

Make sure you have the following installed on your machine:
- **Python 3.10 or 3.11** (`py --version`)
- **Node.js 18+ and npm** (`node -v`, `npm -v`)
- **Git**

---

## 2. Environment Configuration (.env)

Create or check the `.env` file in the root directory:

```env
PORT=8000
LOG_LEVEL=INFO
API_KEY=secret_sentiment_api_key_2026
REQUIRE_API_KEY=false

# Database Configuration (Defaults to SQLite if PostgreSQL is not set)
# DATABASE_URL=postgresql://user:password@localhost:5432/sentiment_db
```

*Note: If `DATABASE_URL` is commented out or empty, the application automatically uses local `sentiment.db` (SQLite).*

---

## 3. Running the FastAPI Backend Server

The FastAPI backend runs the FinBERT ML model and handles REST API requests.

```bash
# Navigate to project directory
cd c:\Users\Mukul\Downloads\Finance-Sentiment-Analysis

# Start Uvicorn Server
py -3.11 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **API Redoc**: `http://localhost:8000/redoc`
- **Health Endpoint**: `http://localhost:8000/health`

---

## 4. Running the Streamlit Dashboard

The Streamlit dashboard offers real-time sentiment gauges, ticker search, and signal tables.

```bash
py -3.11 -m streamlit run dashboard.py
```

- **Dashboard Browser URL**: `http://localhost:8501`

---

## 5. Running the React Web Application

For a modern single-page web interface:

```bash
# Install frontend dependencies (if not already installed)
npm install

# Start Vite Development Server
npm run dev
```

- **Web App URL**: `http://localhost:5173`

---

## 6. API Endpoints Overview

### Local n8n (without Docker)

Keep `npm run dev` running at `http://localhost:3000`, start n8n locally, then open `http://localhost:5678` and import `workflows/sentiment-pipeline.json`. The workflow reads subscriber emails from the website server at `http://localhost:3000/api/internal/subscribers`.

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | Server & DB health status |
| `GET` | `/current_sentiment` | Global market sentiment summary |
| `GET` | `/stock_sentiment?ticker=NVDA` | Detailed sentiment for a specific ticker |
| `GET` | `/top_signals` | Top BUY / SELL trading recommendations |
| `POST` | `/analyze_text` | Ad-hoc text sentiment analysis |
| `POST` | `/webhook/articles` | Bulk ingest articles into DB |
| `POST` | `/run_pipeline` | Full automated scraping + FinBERT + DB pipeline |

---

## 7. Running with Docker Compose

To launch the entire stack in containers (FastAPI + PostgreSQL + n8n):

```bash
# Start all containers in background
docker-compose up -d

# Check container status
docker-compose ps

# Stop containers
docker-compose down
```

---

## 8. Troubleshooting & Common Fixes

- **`Errno 10048` (Port 8000 in use)**:
  Run `netstat -ano | findstr ":8000"` to find the PID, then kill it with `taskkill /F /PID <PID>`.
- **`Connection Refused` in n8n**:
  Ensure URLs in n8n use `http://127.0.0.1:8000` instead of `localhost` on Windows.
