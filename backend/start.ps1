# PhishPulse Backend - Quick Start

Write-Host "Starting PhishPulse Backend..." -ForegroundColor Cyan

# Check if virtual environment exists
if (-not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install/update dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if .env exists
if (-not (Test-Path ".\.env")) {
    Write-Host "Warning: .env file not found. Using defaults." -ForegroundColor Yellow
}

# Start the server
Write-Host ""
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "API docs available at http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

python -m uvicorn app.main:app --reload --port 8000
