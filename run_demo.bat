@echo off
title CentreWatch AI - Demo Video Runner
echo ======================================================================
echo   CentreWatch AI: Live Video Demonstration Launcher (MSDE)
echo ======================================================================
set PYTHONPATH=.

if exist ".venv\Scripts\python.exe" (
    set "PY=.venv\Scripts\python.exe"
) else (
    set "PY=python"
)

echo.
echo [1/3] Seeding Clean Structured Dataset ^& Evidence Snapshots...
%PY% backend/db/seed.py

echo.
echo [2/3] Checking Demo Video Assets...
if not exist "datasets\demo_classroom_discrepancy.mp4" (
    %PY% ai/datasets/synthetic_video_generator.py
)

echo.
echo ======================================================================
echo   SYSTEM READY FOR DEMO VIDEO RECORDING!
echo ======================================================================
echo   Dashboard UI:   http://localhost:8001/dashboard
echo   FastAPI Docs:   http://localhost:8001/docs
echo   Demo Guide:     DEMO_VIDEO_WALKTHROUGH.md
echo ======================================================================
echo.

%PY% -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
pause
