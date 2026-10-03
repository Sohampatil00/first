#!/bin/bash
# ==============================================================================
# CentreWatch AI - Master Demonstration & Validation Suite
# Ministry of Skill Development and Entrepreneurship (MSDE Problem Statement 26245)
# ==============================================================================

set -e

echo "=================================================================="
echo " 🇮🇳 CentreWatch AI: Master Implementation & Live Demo Suite "
echo "=================================================================="

# 1. Activate Python virtual environment
source .venv/bin/activate

# 2. Digital Twin Seeding
echo ""
echo "[Step 1/5] Initializing Digital Twin Database..."
PYTHONPATH=. python3 backend/db/seed.py

# 3. Synthetic Scenario Video Generation
echo ""
echo "[Step 2/5] Generating Deterministic Classroom Test Clip..."
python3 ai/datasets/synthetic_video_generator.py

# 4. Running Edge AI Inference & Telemetry Dispatch
echo ""
echo "[Step 3/5] Running YOLOv8 + ByteTrack Edge Pipeline (TC-101)..."
PYTHONPATH=. python3 ai/inference.py \
  --video datasets/demo_classroom_discrepancy.mp4 \
  --centre TC-101 \
  --camera CAM-101-A1 \
  --room ROOM-101-A

# 5. Demonstrating Offline Resilience & Spool Sync
echo ""
echo "[Step 4/5] Executing Edge Offline Buffering & Recovery Sync Test..."
PYTHONPATH=. python3 edge/test_resilience.py

# 6. Running System Evaluation & Calibration Harness
echo ""
echo "[Step 5/5] Running AI Benchmark Evaluation & Accuracy Metrics..."
PYTHONPATH=. python3 ai/evaluation/evaluate_model.py

echo ""
echo "=================================================================="
echo " ✅ ALL 4 WAVES FULLY IMPLEMENTED & VALIDATED!"
echo "=================================================================="
echo " Access the Live GovTech Platform:"
echo " 👉 Command Centre Dashboard: http://localhost:3000"
echo " 👉 Interactive FastAPI Docs: http://localhost:8001/docs"
echo " 👉 Evaluation Report:        docs/EVALUATION_REPORT.md"
echo "=================================================================="
