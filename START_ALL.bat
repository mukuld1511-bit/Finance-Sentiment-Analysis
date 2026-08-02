@echo off
REM ============================================================================
REM START_ALL.bat - One-click launcher for Finance-Sentiment-Analysis
REM Double-click this file to start the backend, tunnel, and n8n together.
REM Each runs in its own window - close a window to stop that piece.
REM ============================================================================

set PROJECT_DIR=C:\dev\Finance-Sentiment-Analysis

echo Starting Finance-Sentiment-Analysis stack...
echo.

REM -- 1. Backend (FastAPI) --
echo [1/3] Starting backend on http://localhost:8000 ...
start "Backend - FastAPI" cmd /k "cd /d %PROJECT_DIR% && set PATH=%PATH:anaconda=xxxxxxxx% && .venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000"

REM Give the backend a few seconds head start before the tunnel connects to it
timeout /t 8 /nobreak >nul

REM -- 2. ngrok Tunnel (permanent static domain, URL never changes) --
echo [2/3] Starting ngrok tunnel on https://aliens-evaluate-suffocate.ngrok-free.dev ...
start "ngrok Tunnel" cmd /k "ngrok http 8000 --domain=aliens-evaluate-suffocate.ngrok-free.dev"

REM -- 3. n8n --
echo [3/3] Starting n8n on http://localhost:5678 ...
start "n8n" cmd /k "npx n8n"

REM -- 4. Open the master dashboard --
timeout /t 5 /nobreak >nul
start "" "%PROJECT_DIR%\backend_status.html"

echo.
echo All 3 windows launched:
echo   - Backend window: watch for "Uvicorn running on http://0.0.0.0:8000"
echo   - Tunnel window:  copy the https://....trycloudflare.com URL it prints
echo   - n8n window:     open http://localhost:5678 once it's ready
echo.
echo NOTE: If the tunnel URL changes from last time, update it in:
echo   1. Vercel -^> Settings -^> Environment Variables -^> VITE_API_BASE_URL (+ redeploy)
echo   2. n8n -^> Settings -^> Variables -^> BACKEND_API_URL
echo.
pause