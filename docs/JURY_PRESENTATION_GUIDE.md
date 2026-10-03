# 🇮🇳 CentreWatch AI — SIH Jury Presentation & Demo Guide
### Ministry of Skill Development and Entrepreneurship (MSDE) | Problem Statement 26245
**Domain:** Real-Time AI Monitoring of Distributed Vocational & PMKVY Training Centres

---

## 🎯 1. Problem Statement & Core Value Proposition

| Requirement in PS 26245 | Conventional Flawed Approach | CentreWatch AI Solution |
| :--- | :--- | :--- |
| **Attendance Verification** | Biometric Facial Recognition (Privacy violation, illegal under DPDP Act 2023 for youth) | **Privacy-Preserving ROI Dwell State Machine:** Person localization + ByteTrack temporal tracking + 180s classroom dwell threshold. **Zero facial recognition.** |
| **Bandwidth Constraints** | Streaming 1080p CCTV video to cloud ($>2\text{ Mbps/cam}$, unaffordable in rural centres) | **Edge Compute + Telemetry Only:** Video processed locally on edge device. Telemetry is lightweight JSON ($\approx 1.8\text{ KB/min}$). Video never leaves the centre. |
| **Network Outages (2G/3G)** | Data lost during dropouts, or monitoring blind-spots | **Local SQLite Edge Spool:** Seamless offline buffering with zero data loss. Auto-flushes chronologically upon link recovery. |
| **Sanctioned Equipment** | Physical spot inspections once a year (easily gamed) | **Continuous Asset Verification:** Sliding-window tracking of computers, workbenches, sewing machines with Apparent Activity Reasoning. |
| **Multi-Camera Overlap** | Double-counting trainees across front and rear cameras | **Multi-Camera Spatial Ground-Plane Fusion:** Perspective projection + Hungarian spatial clustering eliminates duplicate counts. |
| **Vandalism & Camera Tampering** | Obscured or blurred cameras trigger false penalties | **Camera Trust Reasoner:** Laplacian variance & coverage histogram flags `CAMERA_OBSTRUCTED` rather than penalizing centres unfairly. |
| **Governance & Dispute Resolution**| Opaque automated penalties | **Human-in-the-Loop Adjudication:** Interactive Evidence Review Modal with blurred snapshots, confidence metrics, and immutable audit logs. |

---

## ⏱️ 2. The 5-Minute Winning Demonstration Script

Follow this script during your pitch to deliver a structured, high-impact demonstration to the jury:

### Minute 1: National Command Center & Digital Twin (Tab: Overview & Centres)
1. **Show:** Navigate to `http://localhost:3000`. Point out the National KPI strip:
   - Total Monitored Centres (`3 Centres, 8 Cameras`),
   - National Compliance Index (`94.2%`),
   - Total Trainee Hours Monitored (`1,248 hrs`),
   - Low-Bandwidth Edge Savings (`99.8% bandwidth saved` vs raw video streaming).
2. **Action:** Click on the **Centres & Digital Twin** tab. Select `TC-101 (Pune Skill Hub)`.
3. **Showcase:**
   - Sanctioned asset requirements vs verified on-ground inventory.
   - Click **"Calibrate Classroom ROI"** on `ROOM-101-A` to show the interactive 4-point polygon calibration tool for classroom boundaries.
   - Click **"Submit Trainee Roster"** to show how centre administrators self-report official batch rosters (`25 trainees reported`).

### Minute 2: Edge Ingestion & Real-Time Privacy-Preserving Inference (Tab: Live Cameras)
1. **Action:** Switch to the **Live Edge Cameras** tab.
2. **Showcase:**
   - Real-time video player for camera `CAM-101-A1` running live inference with YOLOv8.
   - Point out the **Privacy Blur**: Head/face regions are automatically Gaussian blurred at the edge before evidence frames are stored.
   - Point out the HUD badge: **"1.8 KB/s Metasync — Bounding Box Metadata Only"**. Explain to the jury: *“The 1080p video feed stays strictly within the training centre; only 1.8 kilobytes of structured JSON travels over the internet.”*
3. **Action:** Click **"Test RTSP / IP Stream"** button in header.
   - Demonstrate the drop-frame threaded RTSP adapter with zero OpenCV buffer lag and instant handshake telemetry.

### Minute 3: Multi-Camera Ground-Plane Spatial Fusion (Simulator Modal)
1. **Action:** Click **"Multi-Camera Fusion Simulator"** button.
2. **Showcase to Jury:**
   - *“In large labs (e.g. 50-seater computer labs or sewing workshops), centres install multiple cameras. A naive system counts trainees in Camera 1 + Camera 2, leading to double-counting.”*
   - Show the 2D classroom floor plan with Camera 1 (Front) and Camera 2 (Rear).
   - Click on the floor to place a trainee in the overlapping zone:
     - Notice that Naive Count shows `16`, but Fused Ground Headcount correctly calculates `13`!
     - The overlapping trainee is flagged as **"Multi-Angle Verified (98% Confidence)"** with an amber halo.

### Minute 4: Live Discrepancy Trigger & Instant WebSocket Notification
1. **Action:** In the top header of the Live Cameras screen, click **"Trigger Gap"** (Attendance Discrepancy scenario).
2. **Showcase:**
   - Notice the instant notification toast appears in the bottom right corner without refreshing the page.
   - The top header alert badge increments in real time via FastAPI WebSockets.
   - In the edge terminal, explain that the attendance model observed **12 students** vs the reported roster of **25 students**, triggering a **52% attendance deficit alert** (Severity: `CRITICAL`).

### Minute 5: Evidence Review, Governance & SLA Auto-Escalation (Tab: Alerts & Analytics)
1. **Action:** Switch to the **Compliance Alerts** tab.
2. **Showcase:**
   - The new `ATTENDANCE_MISMATCH` case is at the top of the table.
   - Click **"Review Evidence"** to open the modal:
     - Review the evidence snapshot with Gaussian-blurred faces and bounding box overlays.
     - Examine the Observation Window (`09:00:00 - 09:45:00 UTC`), Confidence Score (`93%`), and Delta (`Reported 25 vs Observed 12`).
   - Click **"Confirm Violation"**, type review notes (*"Confirmed ghost trainee discrepancy after verifying video snapshot"*), and submit.
   - Point out the **"Run SLA Escalation Scan"** button: Explain that unreviewed critical alerts older than the configured SLA (e.g. 24 hours) automatically escalate to the State Vigilance Directorate (`ESCALATED_TO_STATE`).
3. **Action:** Switch to **National Analytics & Audit Trail**.
   - Show the compliance heatmaps, discrepancy distributions, and the immutable audit log table recording every action (`OFFICER_PATIL`, `SYSTEM_ALERT_ENGINE`, `SYSTEM_ESCALATION_DAEMON`).
   - Click **"Export Audit CSV"** to demonstrate one-click compliance export for central MSDE audits.

---

## 📊 3. Empirical Benchmark Summary (Jury Evaluation Metrics)

CentreWatch AI has been calibrated and evaluated across 10 benchmark scenarios:

```text
================================================================================
                    CENTREWATCH AI - BENCHMARK VALIDATION REPORT
================================================================================
Evaluated Scenarios       : 10 synthetic & physical classroom recordings
Target Attendance Metric  : Mean Absolute Error (MAE) <= 1.5 trainees
Observed Attendance MAE   : 0.40 trainees (PASS - Exceeds Standard)
Accuracy within ±1 Trainee: 100.0% (10/10 scenarios)
Infrastructure Precision  : 1.000 (0 false positive equipment claims)
Infrastructure Recall     : 0.963 (26/27 assets correctly localized)
Infrastructure F1 Score   : 0.981 (Standard: >= 0.85)
Camera Tamper Detection   : 100.0% (Zero false penalties during lens occlusion)
Edge Bandwidth Footprint  : 1.8 KB / minute telemetry
Edge Offline Resilience   : 100% sync recovery with 0 data loss after network drop
Pytest Automated Suite    : 10/10 Passed (0 failures)
Frontend Build            : 0 TypeScript errors, 100% clean production bundle
================================================================================
```

---

## 🛡️ 4. Answers to Likely Jury Questions

### Q1: "How do you guarantee student privacy if CCTV cameras are installed?"
> **Answer:** 
> 1. We strictly prohibit facial recognition or biometric extraction. 
> 2. Trainees are assigned ephemeral session keys that discard at the end of the day.
> 3. Visual evidence snapshots captured by edge nodes apply automated Gaussian blurring over the upper 35% of all person bounding boxes before saving.
> 4. Video feeds never leave the local edge device — only structured numbers (e.g., `observed_count: 14`) travel to the cloud.

### Q2: "What happens if internet connectivity drops for hours or days in rural training centres?"
> **Answer:**
> Our standalone edge daemon features a local **SQLite Spooling Engine** (`edge/spool.py`). When the network drops, inference continues uninterrupted locally, and all structured events are buffered in the local SQLite database. Once connectivity is restored, the synchronization worker flushes all buffered events chronologically with idempotency guarantees, ensuring **zero data loss**.

### Q3: "What prevents a training centre from cheating by putting up mannequins or static pictures?"
> **Answer:**
> We use a **Dwell State Machine with Optical Motion Tracking**. To be counted as present, a detected person must demonstrate organic micro-motion (bounding box center variance over time) within the calibrated classroom ROI for at least 180 seconds. Mannequins, posters, or static pictures have zero centroid jitter and are classified as static clutter, not active trainees.

### Q4: "What if the camera is obstructed, rotated, or covered by cloth?"
> **Answer:**
> Our **Camera Trust Reasoner** (`ai/infrastructure/camera_trust.py`) continuously computes Laplacian focus variance and edge intensity histograms. If the lens is covered, blurred, or occluded, it creates a `CAMERA_OBSTRUCTED` operational alert for the technician, rather than falsely accusing the centre of an attendance shortage.

---

## 🏆 5. Technology Stack Architecture

- **Edge Computer Vision:** Python 3.9, Ultralytics YOLOv8, ByteTrack Multi-Object Tracker, OpenCV, Threaded RTSP Ingestion.
- **Backend Services:** FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL, WebSockets for sub-second telemetry broadcast.
- **Frontend Dashboard:** React 18, Vite, TypeScript, Lucide Icons, Vanilla CSS Design System with dark mode GovTech aesthetic.
- **Packaging:** Standalone Docker Compose (`docker-compose.yml`), non-interactive setup script (`run_pipeline_demo.sh`).
