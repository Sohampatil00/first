# 🎬 CentreWatch AI — Demo Video Recording Guide & Structured Data Manual
### Ministry of Skill Development and Entrepreneurship (MSDE) | Problem Statement 26245

---

## 📌 1. Project Restructuring & New Structured Data Summary

The project has been restructured for a **flawless, professional demo video presentation**. All simplistic dummy data (e.g. orphan records, missing rooms, broken image links) has been removed and replaced with an institutional-grade, multi-state Skill India dataset.

### 🏛️ Seeded Digital Twin Network (6 States Across India)

| Centre ID | Centre Name | State / District | Trade Sectors & Labs | Capacity | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **`TC-101`** | **Pune Advanced Skill & Vocational Hub** | Maharashtra (Pune) | IT-ITeS AI Lab, Automotive Mechanics Workshop, CNC Simulation | 35 | `ACTIVE` *(Flagship Hub)* |
| **`TC-102`** | **Delhi PMKK Skill Training Institute** | NCT Delhi (Okhla Phase III) | Healthcare & GDA Simulation Ward, Emergency Care Bay | 40 | `ACTIVE` |
| **`TC-103`** | **Ranchi ITI Technical Academy** | Jharkhand (Hehal, Ranchi) | Solar PV & Electrical Lab, Welding & Fabrication Bay | 25 | `FLAG_REVIEW` *(Escalated)* |
| **`TC-104`** | **Bengaluru Precision & Robotics Centre**| Karnataka (Electronic City) | Industrial Robotics Cell, PCB Soldering Lab | 30 | `ACTIVE` |
| **`TC-105`** | **Bhopal Regional Vocational Institute** | Madhya Pradesh (Govindpura) | Apparel & Industrial Sewing Bay, Textile CAD Studio | 30 | `ACTIVE` |
| **`TC-106`** | **Jaipur Heritage & Handicrafts Skill Hub**| Rajasthan (Sitapura) | CAD Jewelry Studio, Gem Cutting Workshop | 25 | `ACTIVE` |

---

### 🔍 What Was Restructured & Upgraded

1. **Digital Twin Rooms & Cameras for Every Centre:**
   - Every single centre now has 2–3 fully defined rooms with calibrated 4-point ROI polygons (`ROOM-101-A`, `ROOM-101-B`, `ROOM-102-A`, `ROOM-103-A`, etc.).
   - 10 CCTV/RTSP edge cameras registered across all hubs with realistic statuses (`ONLINE`, `OFFLINE`, `OBSTRUCTED`).
2. **Realistic Sanctioned Mandates & Roster Submissions:**
   - Official PMKVY equipment inventories (`computer`, `workbench`, `sewing_machine`, `medical_bed`, `solar_bench`, `robotic_arm_trainer`).
   - Active batch rosters reported with start/end session hours.
3. **High-Resolution CCTV Evidence Snapshots with Privacy Masking:**
   - Six photorealistic CCTV evidence frames with **DPDP Act 2023 Gaussian privacy blur**, detection bounding boxes, and discrepancy HUDs generated in `evidence_storage/`:
     - `demo_attendance_evidence.jpg`: Attendance mismatch (20 reported vs 12 observed, -40% deficit).
     - `demo_inventory_evidence.jpg`: Missing sanctioned equipment (20 sanctioned vs 17 present).
     - `demo_camera_tamper_evidence.jpg`: Vandalized/blurred lens (Laplacian variance 7.4 < 35.0 threshold).
     - `demo_camera_offline_evidence.jpg`: Offline RTSP feed with local SQLite spool queue status (34 events buffered).
     - `demo_sewing_evidence.jpg`: Sewing machine deficit (-4 units in Bhopal).
     - `demo_healthcare_evidence.jpg`: Clinical rounds verification in Delhi PMKK.
4. **Interactive Tactical India Command Matrix (`OverviewScreen`):**
   - The tactical SVG map now connects all 6 state hubs dynamically with live status rings, hover cards, and one-click filtering.
5. **Universal Discrepancy Breakdown (`AlertReviewModal`):**
   - The discrepancy modal dynamically handles attendance counts, asset quantities, offline durations, and optical variance without any missing values or dashes (`—`).
6. **Unified Dual-Mode Web Dashboard (`backend/main.py`):**
   - The FastAPI backend serves the compiled GovTech UI directly at `http://localhost:8001/dashboard` without requiring separate dev servers, or via Vite at `http://localhost:3000`.

---

## 🚀 2. How to Start the Demo (One-Click)

### Option A: Using PowerShell (Recommended)
```powershell
.\run_demo.ps1
```

### Option B: Using Windows Batch File
Double-click `run_demo.bat` in the project root folder.

### Option C: Manual Launch
```powershell
# 1. Seed pristine structured data and evidence
.venv\Scripts\python.exe backend/db/seed.py

# 2. Launch FastAPI backend
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

### 🌐 Demo URLs to Open in Your Browser
- **Live Command Centre Dashboard:** [http://localhost:8001/dashboard](http://localhost:8001/dashboard) *(or [http://localhost:3000](http://localhost:3000) if running Vite)*
- **Interactive OpenAPI / Swagger Documentation:** [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 🎥 3. Five-Minute Video Recording Walkthrough Script

Follow this scene-by-scene script during your screen recording for a high-impact presentation:

---

### ⏱️ Scene 1 (0:00 – 0:50): National Command Matrix
- **Tab:** **Overview** (`http://localhost:8001/dashboard`)
- **Visuals:**
  1. Highlight the top **National KPI Strip**:
     - *Total Monitored Centres (6)*
     - *Cameras Online (8 / 10)*
     - *National Compliance Rate (94.2%)*
     - *Bandwidth Saved Badge (99.8% saved vs raw RTSP streaming)*
  2. Point out the **Tactical India Command Grid**:
     - Show the 6 nodes across Delhi, Jaipur, Bhopal, Ranchi, Pune, and Bengaluru with animated connection lines.
     - Note the green status rings on compliant hubs, yellow on Bhopal, and red on Ranchi.
  3. **Action:** Click on the **`TC-101 (Pune Hub)`** node on the tactical map to demonstrate interactive filtering.
- **Narrator Voiceover Script:**
  > *"Welcome to CentreWatch AI, an edge-native, privacy-preserving monitoring platform built for the Ministry of Skill Development and Entrepreneurship under Problem Statement 26245. Distributed skill development centers often face infrastructure ghosting, roster inflation, and low rural bandwidth. CentreWatch AI replaces expensive, bandwidth-heavy video streaming with local edge AI telemetry, operating under 2 kilobytes per minute while ensuring complete compliance with the DPDP Act 2023."*

---

### ⏱️ Scene 2 (0:50 – 1:40): Digital Twin & Classroom ROI Calibration
- **Tab:** **Centres & Digital Twin**
- **Visuals:**
  1. Select **`TC-101 (Pune Advanced Skill & Vocational Hub)`**.
  2. Show the Digital Twin hierarchy: Rooms, RTSP Cameras, and Sanctioned Inventory Mandates (`20 Computers`, `25 Chairs`, `8 Workbenches`).
  3. **Action:** Click **"Calibrate Classroom ROI"** on `ROOM-101-A`.
     - Demonstrate the 4-point polygon tool. Explain that only trainees inside the designated classroom boundary are counted, ignoring hallway foot traffic.
  4. **Action:** Click **"Submit Trainee Roster"**.
     - Show how center administrators self-report official batch rosters (`20 trainees reported`).
- **Narrator Voiceover Script:**
  > *"Every accredited center maintains a Digital Twin. Here in TC-101 Pune, we have calibrated the active learning zone with a 4-point classroom ROI polygon. Trainees must dwell inside this active polygon for at least 180 seconds to be verified for session attendance, completely eliminating false counts from passing visitors or hallway pedestrians."*

---

### ⏱️ Scene 3 (1:40 – 2:40): Live Edge Cameras & DPDP Act 2023 Privacy Blur
- **Tab:** **Live Edge Cameras**
- **Visuals:**
  1. Showcase the live inference feed on `CAM-101-A1`.
  2. Point out the **automated Gaussian face blur**:
     - Emphasize that faces are blurred *at the edge hardware* before any evidence snapshot leaves the center.
     - Zero facial recognition, zero Aadhaar access, 100% DPDP Act 2023 compliant.
  3. Highlight the HUD badge: **`1.8 KB/s Metasync — Bounding Box Metadata Only`**.
  4. Toggle the Vision Engine between **DEIM (CVPR 2025)** and **YOLOv8** to highlight state-of-the-art NMS-free transformer detection.
  5. **Action:** Click **"Multi-Camera Fusion Simulator"** button.
     - Show Camera 1 (Front) and Camera 2 (Rear) overlapping view.
     - Show how placing a trainee in the overlapping zone deduplicates naive double-counts (16 down to 13 verified students).
- **Narrator Voiceover Script:**
  > *"On the Live Cameras tab, our edge engine runs real-time localization. Notice the Gaussian blur applied automatically over student faces: we estimate classroom presence through head count and dwell time without ever storing or identifying biometric facial vectors. Furthermore, our Multi-Camera Fusion Engine projects front and rear camera views onto a shared ground-plane, eliminating double-counting in large labs."*

---

### ⏱️ Scene 4 (2:40 – 3:30): Live Discrepancy Trigger & Instant WebSocket Alert
- **Tab:** **Live Edge Cameras** -> **Compliance Alerts**
- **Visuals:**
  1. In the top action bar of the Live Cameras screen, click **"Trigger Gap"** (Attendance Discrepancy scenario).
  2. Point out the immediate real-time toast notification in the bottom right corner.
  3. Note that the header notification bell increments instantly via FastAPI WebSockets.
  4. **Action:** Switch to the **Compliance Alerts** tab.
  5. Point out the newly surfaced case: `ATTENDANCE_MISMATCH (Severity: HIGH)`.
- **Narrator Voiceover Script:**
  > *"When the edge model observes 12 trainees against the reported roster of 20, a 40% deficit exceeds the statutory 15% tolerance threshold. An automated discrepancy alert is dispatched instantly across WebSockets to the Ministry Command Centre."*

---

### ⏱️ Scene 5 (3:30 – 4:20): Evidence Review & Human-in-the-Loop Adjudication
- **Tab:** **Compliance Alerts**
- **Visuals:**
  1. Click **"Review Evidence"** on the `ATTENDANCE_MISMATCH` case at `TC-101`.
  2. In the modal:
     - Review the CCTV evidence snapshot: green bounding boxes on 12 verified students, blurred faces, and red indicators on absent workstations.
     - Point out the 3 discrepancy cards:
       - **Reported Batch Roster:** `20`
       - **AI Observed In Lab:** `12`
       - **Reconciled Delta Gap:** `-8 (-40.0% deficit)`
  3. Select **Root Cause Category:** `Ghost Trainees on Roster (Reported Trainees Absent)`.
  4. Type notes: *"Confirmed discrepancy with center attendance sheet. 8 trainees absent."*
  5. Click **"Confirm Violation"**.
  6. Point out the **"Run SLA Escalation Scan"** button in the header. Mention that alerts unresolved after 24 hours auto-escalate to State Vigilance (`ESCALATED_TO_STATE`).
- **Narrator Voiceover Script:**
  > *"In our Human-in-the-Loop Adjudication modal, monitoring officers inspect privacy-masked visual evidence alongside structured delta metrics. Officers categorize root causes—such as ghost trainees or early departures—which directly feed back into our Active Learning calibration pipeline. The decision is committed to a tamper-evident audit ledger."*

---

### ⏱️ Scene 6 (4:20 – 5:00): Territorial Leaderboard & Audit Ledger Export
- **Tab:** **Analytics** -> **Audit Trail**
- **Visuals:**
  1. Switch to **National Analytics**:
     - Show the **Territorial Compliance Leaderboard** featuring all 6 jurisdictions (Karnataka, Delhi, Rajasthan, Maharashtra, Madhya Pradesh, Jharkhand).
     - Point out the **Human-in-the-Loop Active Learning Calibration Dataset** table at the bottom.
     - Click **"Download Calibration CSV"** to demonstrate one-click audit export.
  2. Switch to **Audit Trail**:
     - Show the chronological ledger recording actions from `OFFICER_PATIL`, `OFFICER_VERMA`, and `SYSTEM_ESCALATION_DAEMON`.
  3. Conclude with summary slide or view.
- **Narrator Voiceover Script:**
  > *"Finally, the National Analytics dashboard aggregates compliance across all states and outputs auditable CSV reports for Central Vigilance Commission oversight. CentreWatch AI delivers unmatched compliance accuracy, offline resilience, and ironclad student privacy—empowering the Ministry of Skill Development with transparent, real-time governance. Thank you!"*

---

## 🛠️ 4. Quick Troubleshooting & Tips

- **Resetting data to clean baseline:**
  Click the **"Reset"** button in the dashboard header or run:
  ```powershell
  .venv\Scripts\python.exe backend/db/seed.py
  ```
- **Testing without a physical camera:**
  The platform comes pre-loaded with `datasets/demo_classroom_discrepancy.mp4` and synthetic evidence snapshots so everything runs out of the box with zero camera hardware required.
- **Connecting your webcam:**
  On the **Live Edge Cameras** tab, click **"Use Laptop / Mobile Webcam"** to test live AI bounding box inference in your room.
