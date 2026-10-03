# 🇮🇳 CentreWatch AI — Real-Time Monitoring of Training Centres
### Ministry of Skill Development and Entrepreneurship (MSDE) | Problem Statement 26245

> **Privacy-Preserving, Low-Bandwidth Edge AI Monitoring Platform for Skill Development Training Centres**

---

## 📌 Executive Summary

CentreWatch AI converts distributed training-centre CCTV feeds into verified attendance and physical infrastructure compliance intelligence. It replaces continuous manual video surveillance with **event-driven discrepancy alerts**, operates reliably under intermittent rural connectivity via **local edge spooling**, and preserves student privacy by **prohibiting biometric facial identification**.

### Core Product Capabilities
1. **Privacy-Preserving Attendance Intelligence:** Estimates session-level physical presence using YOLOv8 person localization, ByteTrack multi-object tracking, and classroom ROI dwell thresholding ($\ge 180\text{s}$) — without biometric face identification.
2. **Infrastructure Compliance Verification:** Monitors approved physical inventory against sanctioned mandates (`computers`, `workbenches`, `sewing machines`, `chairs`) using sliding temporal windows.
3. **Low-Bandwidth Adaptive Edge Mode:** Performs inference locally on edge hardware ($< 2\text{ KB/min}$ telemetry) and uploads visual evidence snapshots **only** when confirmed discrepancies occur.
4. **Offline Resilience & Spool Engine:** Buffers events into an edge SQLite database during network dropouts and automatically synchronizes chronologically upon reconnection.
5. **Human-in-the-Loop Governance:** Every alert provides a structured evidence package (privacy-blurred snapshot, confidence score, observation window, delta comparison) for monitoring officers to confirm or dismiss with full audit logging.

---

## 🏛️ System Architecture

```text
[ CCTV / RTSP Camera ]
         │
         ▼
[ Edge AI Agent Daemon ] ──────────────────────────────────────────────┐
 ├── YOLOv8 Detector (person, computer, workbench, sewing_machine)     │
 ├── ByteTrack Tracker (temporary session keys, no facial ID)          │
 ├── Classroom ROI Dwell Thresholding (>= 180s)                        │
 └── Local SQLite Spool Buffer (edge/spool.db)                         │
         │ (Low-Bandwidth Telemetry & Snapshots)                       │ (Outage Spool)
         ▼                                                             │
[ Central FastAPI Backend (Port 8001) ] <──────────────────────────────┘
 ├── Digital Twin DB (Centres, Rooms, Cameras, Sanctioned Inventory)   (Auto Recovery Sync)
 ├── Compliance Reconciliation Engine (Tolerance ±15%, Asset Deficits)
 ├── Alert Engine & WebSocket Broadcaster
 └── Static Evidence & Video Storage
         │
         ▼
[ GovTech Command Centre UI (Port 3000) ]
 ├── National Monitoring Overview (KPIs, Centres Table, Priority Feed)
 ├── Digital Twin Explorer & Sanctioned Asset Mandates
 ├── Live Video Feeds & Edge Inference Status
 ├── Filterable Compliance Alerts Management Table
 ├── Evidence Review Modal (Blurred Snapshots, Delta Breakdown, Actions)
 └── Governance & Cryptographic Audit Trail
```

---

## 🚀 Quick Start & Live Demonstration

### 1. One-Command Master Demo
Run the complete end-to-end demonstration script:
```bash
./run_pipeline_demo.sh
```
This automated runner will:
- Re-seed the Digital Twin database with realistic baseline centres (`TC-101`, `TC-102`, `TC-103`).
- Generate the deterministic synthetic classroom scenario video (`datasets/demo_classroom_discrepancy.mp4`).
- Execute the YOLOv8 + ByteTrack edge inference pipeline and detect discrepancies.
- Simulate an offline network drop, queue events in SQLite, restore network, and flush batch sync.
- Run the accuracy evaluation benchmark and output the report.

### 2. Live Application Endpoints
- **Command Centre Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend Swagger Docs:** [http://localhost:8001/docs](http://localhost:8001/docs)
- **Model Evaluation Report:** [docs/EVALUATION_REPORT.md](file:///Users/sohampatil/Documents/SIH%202.0/docs/EVALUATION_REPORT.md)

---

## 🧪 Evaluation & Benchmark Calibration

Evaluated across 10 held-out benchmark scenarios (Normal, Occluded, Empty, Crowded, Low Light):

| Metric | Result | Target Standard |
| :--- | :--- | :--- |
| **Attendance Mean Absolute Error (MAE)** | **0.40 trainees** | $< 2.0$ trainees |
| **Attendance Accuracy within $\pm 1$ Trainee** | **100.0%** | $> 90.0\%$ |
| **Infrastructure Asset Precision** | **1.000** | $> 0.85$ |
| **Infrastructure Asset Recall** | **0.963** | $> 0.85$ |
| **Infrastructure F1 Score** | **0.981** | $> 0.85$ |
| **Camera Trust False Accusation Rate** | **0.0%** (Camera obstruction classified as `UNCERTAIN`) | $0.0\%$ |

---

## 🛠️ Repository Structure

```text
SIH 2.0/
├── backend/                  # FastAPI backend server
│   ├── api/                  # REST routers (centres, cameras, attendance, ai_ingest, alerts, settings, demo)
│   ├── db/                   # Database session & demo seeding script
│   ├── models/               # SQLAlchemy models & Pydantic v2 schemas
│   ├── services/             # Compliance rules, alert engine, evidence, camera health, escalation
│   └── tests/                # Automated pytest suite (10/10 passed)
├── frontend/                 # React + TypeScript + Vite GovTech Dashboard
│   ├── src/components/       # Header, Sidebar, KPIStrip, AlertReviewModal, CameraFusionModal, ROIConfigModal
│   ├── src/screens/          # Overview, Centres, LiveCameras, Alerts, Analytics, Audit, Settings
│   └── src/index.css         # GovTech dark-first design system tokens
├── ai/                       # Computer vision & temporal intelligence
│   ├── tracking/             # MultiObjectTracker (ByteTrack logic)
│   ├── attendance/           # AttendanceSessionTracker (ROI dwell state machine)
│   ├── infrastructure/       # InfrastructureMonitor, CameraTrustDetector, ActivityReasoner
│   ├── fusion/               # MultiCameraFusionEngine (spatial overlap de-duplication)
│   ├── datasets/             # Synthetic classroom scenario generator
│   ├── evaluation/           # Benchmark evaluation harness (MAE, Precision, Recall)
│   └── inference.py          # Master Edge Inference Pipeline with face blur
├── edge/                     # Low-bandwidth edge agent & offline resilience
│   ├── agent.py              # Standalone edge daemon
│   ├── stream_capture.py     # Threaded RTSP/IP camera reader with drop-frame latency prevention
│   ├── spool.py              # Local SQLite queue (edge/spool.db)
│   ├── sync.py               # Recovery batch synchronizer
│   └── test_resilience.py    # Automated offline disconnection & recovery test
├── docs/                     # Specifications, evaluation reports & presentation
│   ├── EVALUATION_REPORT.md  # Benchmark calibration & accuracy metrics
│   └── JURY_PRESENTATION_GUIDE.md # 5-minute SIH winning presentation & demo script
├── run_pipeline_demo.sh      # Master one-command demo runner script
└── docker-compose.yml        # Multi-container deployment configuration
```

---

## 📄 License & Attribution
Developed for the **Smart India Hackathon (SIH 2.0)** in accordance with the guidelines and problem statements of the **Ministry of Skill Development and Entrepreneurship (MSDE)**.
# first
