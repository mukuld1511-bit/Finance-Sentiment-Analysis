# ============================================================================
# setup_backend.ps1
# Zero-to-running setup for the Finance-Sentiment-Analysis FastAPI backend.
#
# What this script DOES automate:
#   - Checks Python + pip are installed
#   - Creates a virtual environment (venv)
#   - Installs all Python dependencies from requirements.txt
#   - Creates a working .env file from .env.example (if missing)
#   - Starts the FastAPI server
#
# What this script does NOT install (see BACKEND_SETUP_FROM_ZERO.md for why
# and how to install these manually - they need their own installers):
#   - Python itself, Git, Node.js, n8n, Cloudflare Tunnel (cloudflared)
#
# USAGE:
#   1. Open PowerShell in the project folder (where app.py lives)
#   2. Run:  powershell -ExecutionPolicy Bypass -File setup_backend.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Write-Ok($msg) {
    Write-Host "    OK: $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
    Write-Host "    WARNING: $msg" -ForegroundColor Yellow
}

function Write-Fail($msg) {
    Write-Host "    ERROR: $msg" -ForegroundColor Red
}

# -- 0. Confirm we're in the right folder ------------------------------------
Write-Step "Checking you're in the project folder"
if (-not (Test-Path ".\app.py")) {
    Write-Fail "app.py not found in the current folder."
    Write-Host "    cd into the folder where you extracted/cloned the project, then re-run this script."
    exit 1
}
Write-Ok "Found app.py - we're in the right place."

# -- 0.5 Strip Anaconda from PATH for this process --
# Anaconda's Library\bin ships its own MKL/OpenMP DLLs (e.g. libiomp5md.dll)
# that conflict with the ones torch bundles, causing:
#   OSError: [WinError 1114] ... Error loading "...torch\lib\c10.dll"
# Removing anaconda from PATH (for this process only -- doesn't touch your
# system settings or uninstall anything) avoids that clash.
if ($env:PATH -match "anaconda") {
    Write-Step "Anaconda detected on PATH - excluding it for this session to avoid torch DLL conflicts"
    $env:PATH = ($env:PATH -split ';' | Where-Object { $_ -notmatch 'anaconda' }) -join ';'
    Write-Ok "Anaconda paths excluded (only for this PowerShell session)"
}

# -- 1. Check Python ------------------------------------------------------
Write-Step "Checking Python installation"
$pythonCmd = $null
foreach ($cmd in @("py -3.11", "py", "python")) {
    try {
        $verOutput = & cmd /c "$cmd --version" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pythonCmd = $cmd
            Write-Ok "$cmd -> $verOutput"
            break
        }
    } catch { }
}
if (-not $pythonCmd) {
    Write-Fail "Python not found on PATH."
    Write-Host "    Install Python 3.11 or newer from https://www.python.org/downloads/"
    Write-Host "    IMPORTANT: during install, check 'Add python.exe to PATH'."
    exit 1
}

# -- 2. Create virtual environment ---------------------------------------
Write-Step "Setting up virtual environment (.venv)"
if (-not (Test-Path ".\.venv")) {
    & cmd /c "$pythonCmd -m venv .venv"
    Write-Ok "Created .venv"
} else {
    Write-Ok ".venv already exists, reusing it"
}

$venvPython = ".\.venv\Scripts\python.exe"
$venvPip    = ".\.venv\Scripts\pip.exe"

# -- 3. Install dependencies ---------------------------------------------
Write-Step "Installing Python dependencies from requirements.txt (this downloads torch - can take 5-15 min on first run)"
& $venvPython -m pip install --upgrade pip
& $venvPip install -r requirements.txt
Write-Ok "Dependencies installed"

# -- 4. Set up .env -------------------------------------------------------
Write-Step "Setting up .env file"
if (-not (Test-Path ".\.env")) {
    if (Test-Path ".\.env.example") {
        Copy-Item ".\.env.example" ".\.env"
        Write-Ok "Created .env from .env.example (defaults to local SQLite DB - no Postgres needed)"
    } else {
        Write-Warn ".env.example not found - skipping. The backend will still run with built-in defaults."
    }
} else {
    Write-Ok ".env already exists, leaving it untouched"
}

# -- 5. Quick sanity import check ----------------------------------------
Write-Step "Verifying key packages import correctly"
& $venvPython -c 'import torch, transformers, fastapi, sqlalchemy; print("torch", torch.__version__); print("transformers", transformers.__version__); print("fastapi", fastapi.__version__)'
Write-Ok "Core packages OK"

# -- 6. Start the backend ------------------------------------------------
Write-Step "Starting FastAPI backend on http://0.0.0.0:8000"
Write-Host "    First request will be slow (~30-60s) while FinBERT model downloads/loads."
Write-Host "    Press CTRL+C to stop the server."
Write-Host "    Leave this window open - closing it stops the backend."
Write-Host ""
& $venvPython -m uvicorn app:app --host 0.0.0.0 --port 8000