# ==============================================================================
# CentreWatch AI - One-Click Demonstration Launcher for Demo Video Recording
# Ministry of Skill Development and Entrepreneurship (MSDE Problem Statement 26245)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  🇮🇳 CentreWatch AI: Live Video Demonstration Launcher (MSDE)         " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

# Set PYTHONPATH to project root
$env:PYTHONPATH = "."

# Find Python interpreter
$py = "python"
if (Test-Path ".\.venv\Scripts\python.exe") {
    $py = ".\.venv\Scripts\python.exe"
}

Write-Host ""
Write-Host "[1/3] Generating Structured Digital Twin Dataset & CCTV Evidence..." -ForegroundColor Cyan
& $py backend/db/seed.py

Write-Host ""
Write-Host "[2/3] Checking Demo Synthetic Video Assets..." -ForegroundColor Cyan
if (-not (Test-Path "datasets/demo_classroom_discrepancy.mp4")) {
    & $py ai/datasets/synthetic_video_generator.py
} else {
    Write-Host "-> datasets/demo_classroom_discrepancy.mp4 verified." -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/3] Launching CentreWatch AI Backend & GovTech Command Centre..." -ForegroundColor Cyan
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " 🚀 SYSTEM READY FOR DEMO VIDEO RECORDING! " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " 👉 Command Centre UI Dashboard:  http://localhost:8001/dashboard" -ForegroundColor Yellow
Write-Host " 👉 Alternate Dev Server (Vite):  http://localhost:3000" -ForegroundColor Gray
Write-Host " 👉 Interactive OpenAPI Docs:     http://localhost:8001/docs" -ForegroundColor Yellow
Write-Host " 👉 Step-by-Step Video Script:    DEMO_VIDEO_WALKTHROUGH.md" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " Press Ctrl+C in this terminal to stop the server." -ForegroundColor DarkGray
Write-Host ""

& $py -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
