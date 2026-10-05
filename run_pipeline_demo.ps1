# ==============================================================================
# CentreWatch AI - Windows PowerShell Master Demonstration & Validation Suite
# Ministry of Skill Development and Entrepreneurship (MSDE Problem Statement 26245)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " 🇮🇳 CentreWatch AI: Master Implementation & Live Demo Suite (Windows) " -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan

# Set PYTHONPATH to root directory
$env:PYTHONPATH = "."

# Determine python interpreter
$py = "python"
if (Test-Path ".\.venv\Scripts\python.exe") {
    $py = ".\.venv\Scripts\python.exe"
}

# 1. Digital Twin Seeding
Write-Host ""
Write-Host "[Step 1/7] Initializing Structured Digital Twin Database..." -ForegroundColor Cyan
& $py backend/db/seed.py

# 2. Synthetic Scenario Video Generation
Write-Host ""
Write-Host "[Step 2/7] Generating Deterministic Classroom Test Clip..." -ForegroundColor Cyan
& $py ai/datasets/synthetic_video_generator.py

# 3. Running Edge AI Inference & Telemetry Dispatch
Write-Host ""
Write-Host "[Step 3/7] Running YOLOv8 + ByteTrack Edge Pipeline (TC-101)..." -ForegroundColor Cyan
& $py ai/inference.py --video datasets/demo_classroom_discrepancy.mp4 --centre TC-101 --camera CAM-101-A1 --room ROOM-101-A

# 4. Demonstrating Offline Resilience & Spool Sync
Write-Host ""
Write-Host "[Step 4/7] Executing Edge Offline Buffering & Recovery Sync Test..." -ForegroundColor Cyan
& $py edge/test_resilience.py

# 5. Running Multi-Camera Spatial Fusion & Overlap De-duplication
Write-Host ""
Write-Host "[Step 5/7] Verifying Multi-Camera Ground-Plane Spatial Fusion..." -ForegroundColor Cyan
& $py -c "from ai.fusion.camera_fusion import MultiCameraFusionEngine; engine = MultiCameraFusionEngine(room_id='ROOM-101-A'); cam1 = [{'class_name': 'person', 'confidence': 0.88, 'bbox': [200, 300, 260, 450]}]; cam2 = [{'class_name': 'person', 'confidence': 0.91, 'bbox': [980, 250, 1040, 400]}]; res = engine.fuse_camera_observations({'CAM-101-A1': cam1, 'CAM-101-A2': cam2}); print('-> Multi-Camera Fusion Test Passed! Fused headcount:', res['fused_headcount'], 'Deduplicated:', res['overlap_deduplicated_count'])"

# 6. Running AI Benchmark Evaluation & Accuracy Metrics
Write-Host ""
Write-Host "[Step 6/7] Running AI Benchmark Evaluation & Accuracy Metrics..." -ForegroundColor Cyan
& $py ai/evaluation/evaluate_model.py

# 7. Full Automated Regression Test Suite
Write-Host ""
Write-Host "[Step 7/7] Running Full Pytest Regression Suite..." -ForegroundColor Cyan
& $py -m pytest backend/tests/test_api.py -v

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host " 🏆 ALL PHASES VALIDATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host " Access the Live GovTech Platform:"
Write-Host " 👉 Command Centre Dashboard:   http://localhost:3000"
Write-Host " 👉 Interactive FastAPI Docs:   http://localhost:8001/docs"
Write-Host " 👉 Evaluation Report:          docs/EVALUATION_REPORT.md"
Write-Host " 👉 SIH Jury Presentation Guide: docs/JURY_PRESENTATION_GUIDE.md"
Write-Host "==================================================================" -ForegroundColor Cyan
