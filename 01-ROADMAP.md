# AI-Based Real-Time Monitoring of Training Centres
## Master Development Roadmap — 21 Engineering Phases

**Problem Statement:** 26245  
**Organization:** Ministry of Skill Development and Entrepreneurship (MSDE)  
**Theme:** Smart Education  
**Project Goal:** Build a privacy-preserving, low-bandwidth, AI-assisted monitoring platform that converts training-centre camera feeds into reliable attendance and infrastructure observations, compares them with centre-reported/sanctioned data, generates evidence-backed compliance alerts, and routes those alerts to human reviewers.

---

# 1. Roadmap Philosophy

This roadmap is deliberately structured as **21 engineering phases** rather than one large "build the AI" task.

The core reasoning is:

```text
Requirements
    ↓
Digital Centre Model
    ↓
Data + Video Pipeline
    ↓
AI Perception
    ↓
Tracking + Temporal Reasoning
    ↓
Attendance / Infrastructure Observations
    ↓
Compliance Rules
    ↓
Evidence + Alerts
    ↓
Backend + Dashboard
    ↓
Edge + Offline Operation
    ↓
Privacy + Security
    ↓
Evaluation
    ↓
Deployment + Demo
```

The system should be designed as an **AI-assisted exception monitoring platform**, not as a generic CCTV surveillance product and not as an autonomous enforcement engine.

The fundamental principle is:

```text
AI observation
      ≠
confirmed violation
```

Instead:

```text
AI observation
      ↓
structured comparison
      ↓
exception / alert
      ↓
evidence
      ↓
human review
      ↓
auditable outcome
```

---

# 2. Final Product Scope

The finished platform should support five connected capabilities:

### A. Attendance Intelligence
Estimate session-level physical presence from video without requiring facial identification.

### B. Infrastructure Compliance Intelligence
Compare visible infrastructure against a sanctioned inventory and identify missing, uncertain or apparently active/inactive items where visual evidence supports such a classification.

### C. Real-Time Exception Monitoring
Convert persistent discrepancies into structured alerts instead of forcing officers to watch raw video.

### D. Edge + Low-Bandwidth Operation
Perform inference close to the camera and send events/metadata rather than continuously uploading full-resolution video.

### E. Human-Reviewable Governance
Provide evidence, confidence, timestamps, review status and audit history for every important alert.

---

# 3. The 21 Development Phases

---

## Phase 0 — Problem Decomposition and Success Definition

### Objective
Translate the official problem statement into precise engineering requirements and measurable acceptance criteria.

### Why this phase exists
The problem combines computer vision, attendance verification, asset compliance, networking, privacy and government monitoring workflows. Starting with code before defining these boundaries creates rework and ambiguous AI outputs.

### Detailed work
- Identify primary actors: centre administrator, district monitoring officer, state monitoring officer, ministry monitoring officer and system administrator.
- Define centre, room, classroom, workshop, session, camera, sanctioned inventory, attendance record, AI observation, compliance event, evidence and review entities.
- Separate **observation**, **rule evaluation**, and **human decision**.
- Define the meaning of `present`, `not observed`, `uncertain`, `camera offline`, `camera obstructed` and `apparently active`.
- Define configurable thresholds instead of hard-coding a single universal policy.
- Establish what the MVP will and will not do.
- Define the evaluation population and testing scenarios.

### Key outputs
- Product requirements document.
- Functional requirements.
- Non-functional requirements.
- User-role matrix.
- Event taxonomy.
- Initial acceptance criteria.

### Exit gate
Every major requirement can be expressed as **input → processing → output → acceptance rule**.

### Main risk addressed
Building an impressive demo that is technically unrelated to the real operational problem.

---

## Phase 1 — Product Workflow, UX Contracts and Information Architecture

### Objective
Design the human workflow before frontend and backend implementation diverge.

### Core officer journey

```text
Overview
   ↓
Centre
   ↓
Alert
   ↓
Evidence
   ↓
Review
   ↓
Confirm / Dismiss
   ↓
Resolve / Escalate
```

### Detailed work
- Design the Overview, Centres, Live Cameras, Attendance, Infrastructure, Alerts, Evidence Review, Reports, Analytics, Audit Log and Settings flows.
- Define empty, loading, offline, low-confidence and error states.
- Define how AI uncertainty is communicated in the UI.
- Define common status and severity vocabulary.
- Create shared frontend/backend contracts using typed schemas.
- Define which actions are available to each role.

### Key outputs
- User journeys.
- Low-fidelity wireframes.
- Navigation model.
- API payload contracts.
- Shared status/severity model.

### Exit gate
A frontend developer and backend developer can implement the same screen/event without inventing conflicting data fields or meanings.

### Innovation opportunity
Design the dashboard around **exceptions and evidence**, not around dozens of raw metrics.

---

## Phase 2 — Engineering Foundation and Repository Architecture

### Objective
Create a stable technical base that supports parallel team development.

### Recommended structure

```text
training-centre-ai/
├── frontend/
├── backend/
├── ai/
├── edge/
├── datasets/
├── models/
├── docs/
└── infrastructure/
```

### Detailed work
- Initialize Git repository and branch strategy.
- Set up Next.js/TypeScript frontend.
- Set up FastAPI/Python backend.
- Set up PostgreSQL/Supabase database.
- Set up AI service and inference interface.
- Set up edge-agent package.
- Add Docker development environment.
- Add `.env` handling and secret management conventions.
- Add formatting, linting, typing and unit-test scaffolding.
- Add structured logging and correlation IDs.
- Establish API versioning and error conventions.

### Key outputs
- Running frontend shell.
- Running backend shell.
- Database connectivity.
- AI service shell.
- Edge service shell.
- Local development instructions.

### Exit gate
A new contributor can clone the repository, configure environment variables and run the core stack reliably.

---

## Phase 3 — Centre Digital Twin: Centre, Room, Camera and Inventory Configuration

### Objective
Build the digital model that tells the AI what exists, where it exists and what is expected.

### Core entities

```text
Centre
 ├── Rooms
 │    ├── Cameras
 │    └── Zones / ROIs
 ├── Sessions
 └── Sanctioned Inventory
```

### Detailed work
- Centre onboarding.
- Room/class/workshop mapping.
- Camera registration.
- Camera-to-room mapping.
- Sanctioned capacity configuration.
- Inventory type and required quantity configuration.
- Zone/ROI polygon configuration.
- Session schedule configuration.
- Camera calibration metadata.

### Example

```text
TC001
 ├── Classroom A
 │    └── CAM01
 ├── Workshop A
 │    └── CAM02
 └── Inventory
      ├── 20 computers
      ├── 10 workbenches
      └── 35 chairs
```

### Exit gate
A camera stream can be associated with a precise room, monitoring zone, expected session and sanctioned inventory.

### Main insight
Configuration is not an administrative side feature. It is part of the AI inference context.

---

## Phase 4 — Video Ingestion, Frame Sampling and Dataset Engineering

### Objective
Create a repeatable process from camera/video input to training/evaluation data.

### Detailed work
- Accept sample video files and simulated camera streams.
- Support RTSP-like stream abstraction for later deployment.
- Extract representative frames.
- Preserve source clip/session metadata.
- Define annotation classes.
- Define bounding-box annotation rules.
- Version datasets.
- Split datasets by **scene/session**, not adjacent frames from the same video.
- Maintain a frozen test set.
- Record environmental conditions such as lighting, crowding and camera angle.

### Required scenarios
- Normal attendance.
- Low attendance.
- Over-reported attendance.
- Empty classroom.
- People entering/exiting.
- Occlusion.
- Crowded classroom.
- Low-light footage.
- Low-resolution footage.
- Missing equipment.
- Moved equipment.
- Partially occluded equipment.

### Exit gate
The team has Dataset v1, annotation rules, a documented split and a held-out test set.

### Main risk addressed
Overfitting to a single demo video.

---

## Phase 5 — Baseline Object Detection and Model Benchmarking

### Objective
Create the perception layer that detects people and relevant infrastructure.

### Approach
Start from a pretrained YOLO-family detector or equivalent modern detector and fine-tune only classes that materially support the compliance problem.

### Initial classes
Potentially:

```text
person
chair
computer
workbench
machine
sewing_machine
other centre-specific equipment
```

The actual taxonomy should remain configurable according to the provided footage and sanctioned inventory.

### Detailed work
- Establish pretrained baseline.
- Fine-tune on centre-specific data.
- Tune image size and confidence threshold.
- Evaluate per-class performance.
- Review false positives.
- Review missed detections.
- Export inference-ready weights.
- Record model version with each evaluation.

### Important principle
Do not optimize only for generic object-detection metrics. The real business metric is whether detections produce reliable **attendance and infrastructure observations**.

### Exit gate
Required classes are detectable under normal demo conditions with documented metrics and known limitations.

---

## Phase 6 — Multi-Object Tracking and Temporal Continuity

### Objective
Turn independent frame detections into stable temporary tracks.

### Why it matters
Without tracking, the same person can be counted many times and the same machine can fluctuate between detected/not-detected from frame to frame.

### Detailed work
- Integrate ByteTrack, DeepSORT or equivalent tracker.
- Assign temporary track IDs.
- Handle short detection gaps.
- Filter unstable tracks.
- Test entry/exit events.
- Test partial occlusion.
- Test crowded movement.
- Measure track stability.

### Privacy constraint
Tracking IDs are technical session identifiers only. They must not become identity labels.

### Exit gate
The same person/object does not produce multiple counts during ordinary movement through the scene.

### Innovation opportunity
Use **temporal consistency** as a second confidence layer over raw detector confidence.

---

## Phase 7 — Privacy-Preserving Attendance Intelligence

### Objective
Convert tracked people into a session-level estimate of actual physical presence.

### Attendance state machine

```text
NOT_SEEN
   ↓
DETECTED
   ↓
IN_ZONE
   ↓
DWELL_THRESHOLD_REACHED
   ↓
PRESENT
   ↓
LEFT_ZONE
```

### Detailed work
- Define classroom/worshop ROI.
- Count only tracks whose relevant point lies within configured zones.
- Add minimum dwell time.
- Handle brief doorway crossings.
- Handle temporary occlusion.
- Produce unique observed count per session.
- Store observation window and confidence.
- Avoid face recognition by default.

### Example

```text
Reported attendance = 42
Observed attendance = 36
Observation window = 09:30–10:00
```

### Exit gate
The system reports a session-level presence estimate rather than a naive per-frame count.

### Privacy design
Default output is:

```text
presence + count + timing
```

not:

```text
person identity + name + biometric profile
```

---

## Phase 8 — Attendance Reconciliation and Discrepancy Intelligence

### Objective
Compare centre-reported attendance with AI-derived observed attendance in a policy-aware way.

### Core calculations

```text
absolute_difference = |reported - observed|

relative_difference =
|reported - observed| / max(reported, 1)
```

### Detailed work
- Import or enter reported attendance.
- Match record to centre/session.
- Compare with AI observation.
- Apply configurable tolerance.
- Apply persistence/observation-window logic.
- Generate discrepancy evidence.
- Assign preliminary severity.

### Example policy model

```text
Within configured tolerance
        ↓
NORMAL

Above tolerance and persistent
        ↓
REVIEW

Large and persistent discrepancy
        ↓
HIGH PRIORITY
```

### Exit gate
The discrepancy decision is reproducible from structured reported and observed data.

### Main risk addressed
Generating alerts from insignificant or transient counting noise.

---

## Phase 9 — Infrastructure Detection and Asset Intelligence

### Objective
Recognize the infrastructure categories that matter for scheme compliance.

### Detailed work
- Train/fine-tune equipment detector.
- Use centre-specific inventory classes where needed.
- Apply zone-aware detection.
- Track equipment temporally.
- Reject low-confidence transient detections.
- Aggregate observations over time.
- Record evidence frame references.

### Output model

```text
item_type
observed_count
confidence
zone
camera_id
observation_window
```

### Exit gate
The system produces repeatable inventory observations for the main sanctioned equipment classes.

### Innovation opportunity
Use a **digital inventory baseline** so each centre is evaluated against its own sanctioned configuration rather than one generic equipment list.

---

## Phase 10 — Infrastructure Compliance and Apparent Activity Reasoning

### Objective
Turn equipment observations into meaningful compliance states without overstating what video can prove.

### Core comparison

```text
Sanctioned quantity
        vs
Observed quantity
```

### Status vocabulary

```text
PRESENT
NOT_OBSERVED
UNCERTAIN
APPARENTLY_ACTIVE
APPARENTLY_INACTIVE
```

### Detailed work
- Compare required and observed quantity.
- Apply observation windows.
- Consider occlusion.
- Check camera health before declaring absence.
- Use visible human-equipment interaction as one activity cue.
- Use visible motion, displays or indicator states where genuinely observable.
- Record evidence and confidence.

### Important limitation
Video should not be presented as proof of mechanical functionality unless the system has a reliable modality for that specific claim.

### Exit gate
Infrastructure compliance is generated from temporally aggregated observations with uncertainty represented explicitly.

---

## Phase 11 — Event, Severity and Alert Intelligence Engine

### Objective
Convert validated discrepancies into standardized event records.

### Initial event taxonomy

```text
ATTENDANCE_MISMATCH
INFRASTRUCTURE_GAP
CAMERA_OFFLINE
CAMERA_OBSTRUCTED
LOW_CONFIDENCE_OBSERVATION
```

### Detailed work
- Define event schema.
- Add event IDs.
- Add severity.
- Add confidence.
- Add timestamp and observation window.
- Add centre/camera/session references.
- Attach evidence references.
- Add alert deduplication.
- Add persistence rules.
- Add escalation state.

### Recommended event payload

```json
{
  "event_id": "...",
  "centre_id": "TC001",
  "camera_id": "CAM01",
  "event_type": "ATTENDANCE_MISMATCH",
  "severity": "HIGH",
  "confidence": 0.91,
  "timestamp": "...",
  "observation_window": "...",
  "payload": {},
  "evidence_ref": "...",
  "status": "NEW"
}
```

### Exit gate
Every actionable exception follows one common event model that the backend, dashboard and reports understand.

---

## Phase 12 — Evidence Generation and Human-Reviewable Case Management

### Objective
Make every important alert understandable and reviewable.

### Evidence package
Each alert should provide:
- Centre.
- Room/camera.
- Timestamp.
- Event type.
- Observation window.
- Confidence.
- Structured reason.
- Snapshot or short clip where policy allows.
- Model/inference version.

### Review workflow

```text
NEW
 ↓
UNDER_REVIEW
 ↓
CONFIRMED / DISMISSED
 ↓
RESOLVED / ESCALATED
```

### Detailed work
- Evidence storage references.
- Review notes.
- Reviewer identity.
- Review timestamps.
- Escalation path.
- Resolution metadata.
- Immutable event history.

### Exit gate
An officer can understand why an alert exists without watching the entire raw camera stream.

### Core governance rule
The system recommends where attention is needed; human reviewers retain operational control over consequential decisions.

---

## Phase 13 — Backend, Database and Realtime Integration

### Objective
Connect all observations and events into a durable application platform.

### Suggested APIs

```text
POST /api/centres
GET  /api/centres

POST /api/cameras
GET  /api/cameras

POST /api/inventory
GET  /api/inventory/{centre_id}

POST /api/attendance/report
GET  /api/attendance/{centre_id}

POST /api/observations
GET  /api/observations/{centre_id}

GET  /api/alerts
PATCH /api/alerts/{id}

GET  /api/reports
GET  /api/analytics
```

### Detailed work
- Database schema and migrations.
- Pydantic request/response models.
- Validation.
- Authentication.
- Authorization.
- Observation persistence.
- Event persistence.
- Evidence references.
- WebSocket updates.
- Idempotency and deduplication.
- Error handling.

### Exit gate
A real inference event can travel from AI → API → database → realtime UI without manual database editing.

---

## Phase 14 — Monitoring Dashboard and Command Centre UX

### Objective
Build the operational control surface for monitoring units.

### Core screens

```text
Overview
Centres
Live Cameras
Attendance
Infrastructure
Alerts
Evidence Review
Reports
Analytics
Audit Log
Settings
```

### Overview should show
- Monitored centres.
- Current alert count.
- New/high-priority alerts.
- Centre compliance trends.
- Camera/device health.
- Regional summaries.

### Centre detail should show
- Reported attendance.
- AI observed attendance.
- Attendance gap.
- Sanctioned inventory.
- Observed inventory.
- Evidence.
- Alert history.
- Review status.

### UX principle
Use progressive disclosure: the overview stays calm and operational, while deeper screens expose evidence and technical details.

### Exit gate
A non-technical monitoring officer can navigate from a summary to a specific alert, inspect evidence and record a review outcome.

---

## Phase 15 — Low-Bandwidth Edge Inference and Local Processing

### Objective
Make the architecture realistic for rural and semi-urban training centres.

### Target architecture

```text
Camera
  ↓
Edge Agent
  ↓
Local inference
  ↓
Local aggregation
  ↓
Event / metadata sync
  ↓
Cloud backend
```

### What should normally leave the centre
- Counts.
- Event metadata.
- Confidence.
- Timestamps.
- Camera health.
- Small evidence payloads when required.

### What should not be continuously uploaded by default
- Full-resolution raw video streams.

### Optimization methods
- Frame sampling.
- Reduced inference FPS.
- Appropriate input resolution.
- Event-driven evidence upload.
- Compression.
- Retry/backoff.
- Local buffering.

### Exit gate
The core monitoring pipeline runs on the edge with materially reduced network dependence.

### Innovation opportunity
Treat bandwidth as a system constraint from the beginning instead of adding "low bandwidth mode" after cloud streaming is already built.

---

## Phase 16 — Offline Resilience, Synchronization and Device Health

### Objective
Keep monitoring meaningful when connectivity or cameras fail.

### Offline architecture

```text
Network unavailable
       ↓
Edge continues inference
       ↓
Event stored locally
       ↓
Durable queue / SQLite
       ↓
Network restored
       ↓
Batch sync
       ↓
Server idempotency check
       ↓
Stored centrally
```

### Device health signals
- Last frame timestamp.
- FPS.
- Freeze duration.
- Reconnect count.
- Brightness.
- Blur/quality indicators.
- Obstruction heuristic.
- CPU/RAM/GPU.
- Disk capacity.
- Last successful sync.

### Critical distinction

```text
NO PEOPLE DETECTED
```

must not be interpreted as:

```text
CAMERA OFFLINE
```

### Exit gate
The platform can distinguish monitoring silence caused by the environment from silence caused by technical failure.

---

## Phase 17 — Privacy, Security, RBAC and Audit Governance

### Objective
Protect centre data, minimize personal information and make important actions attributable.

### Privacy defaults
- No facial identification by default.
- No face database.
- No name matching from video.
- Temporary technical track IDs only.
- Aggregate presence wherever individual identity is unnecessary.
- Evidence retention should be purpose- and policy-driven.

### Security work
- TLS.
- Secure device credentials.
- Secret management.
- Least-privilege access.
- Role-based authorization.
- Secure evidence access.
- Input validation.
- Rate limiting where appropriate.
- Audit logging.

### Suggested roles

```text
Centre Admin
District Monitoring Officer
State Monitoring Officer
Ministry Monitoring Officer
System Administrator
```

### Audit events
- Login.
- Centre configuration change.
- Inventory edit.
- Camera configuration change.
- Alert review.
- Evidence access.
- Resolution.
- Report generation.

### Exit gate
Sensitive actions are traceable and the default product design does not require unnecessary biometric identification.

---

## Phase 18 — Analytics, Reports and Centre Intelligence

### Objective
Move from individual alerts to useful longitudinal monitoring.

### Reports
- Daily centre report.
- Weekly centre report.
- Attendance discrepancy report.
- Infrastructure compliance report.
- Camera/device uptime report.
- Regional summary.

### Analytics
Track:

```text
attendance compliance
infrastructure compliance
alert frequency
confirmed vs dismissed alerts
camera uptime
recurring discrepancy patterns
```

### Intelligent analytics
Use historical data to surface patterns such as:

```text
Repeated attendance discrepancy
Repeated camera failure
Recurring equipment non-observation
Sudden change in occupancy pattern
```

These should remain **review triggers**, not automatic findings of misconduct.

### Exit gate
An officer can identify recurring operational patterns without manually combining raw event data.

---

## Phase 19 — Comprehensive Evaluation, False-Positive/False-Negative Analysis and Calibration

### Objective
Quantify how well the entire system works and where it fails.

### Detection metrics
- Precision.
- Recall.
- F1.
- mAP where appropriate.

### Attendance metrics
- Mean Absolute Error (MAE).
- Exact count match rate.
- Within ±1 count.
- Within ±2 counts.
- Discrepancy precision/recall where labeled data exists.

### Infrastructure metrics
- Per-class precision.
- Per-class recall.
- F1.
- mAP.

### Alert metrics
- True positives.
- False positives.
- True negatives.
- False negatives.
- Precision.
- Recall.
- Time to alert.

### System metrics
- End-to-end latency.
- Edge inference FPS.
- CPU/GPU utilization.
- Memory usage.
- Bandwidth consumed.
- Offline queue reliability.
- Camera uptime detection latency.

### Adversarial/real-world tests
- Low light.
- Occlusion.
- Crowd density.
- Camera repositioning.
- Low-resolution footage.
- Temporary object obstruction.
- Equipment moved.
- Camera freeze.
- Camera disconnect.
- Network outage.
- Network recovery.

### Calibration
Tune thresholds on validation data, then evaluate final performance only on the frozen test set.

### Exit gate
The team can present quantitative performance, false-positive/false-negative examples and known limitations honestly.

---

## Phase 20 — End-to-End Hardening, Deployment, Demonstration and Handover

### Objective
Turn the engineering prototype into a repeatable hackathon-ready system.

### Full system path

```text
Camera
  ↓
Edge ingestion
  ↓
Object detection
  ↓
Tracking
  ↓
Attendance / infrastructure aggregation
  ↓
Compliance rules
  ↓
Event engine
  ↓
Evidence
  ↓
Backend API
  ↓
Database
  ↓
Realtime dashboard
  ↓
Human review
  ↓
Reports / analytics
```

### Deployment work
- Dockerize services.
- Add database migration process.
- Seed demo centres.
- Bundle sample video.
- Configure AI model weights.
- Verify evidence storage.
- Verify realtime updates.
- Verify offline queue and recovery.
- Verify logging.
- Verify backup/recovery documentation.
- Create one-command local/demo startup.

### Recommended deterministic demo

```text
1. Open centre dashboard.
2. Select a training centre.
3. Show sanctioned attendance/inventory.
4. Start sample live/periodic camera feed.
5. Show people detection/tracking.
6. Show observed attendance.
7. Trigger attendance discrepancy.
8. Show infrastructure gap.
9. Generate evidence-backed alert.
10. Open evidence review.
11. Confirm or dismiss the case.
12. Show analytics/report entry.
13. Disconnect network.
14. Show edge processing continues.
15. Restore network.
16. Show queued events synchronize.
```

### Final demo message

The product should be presented as:

> **A privacy-preserving AI monitoring layer that converts distributed training-centre CCTV into structured, reviewable compliance intelligence, while remaining usable under real-world connectivity constraints.**

### Exit gate
The complete solution runs from a clean environment and the full demonstration works without manually editing database records or bypassing the actual product flow.

---

# 4. Phase Dependency Map

The phases are logically ordered, but teams can work in parallel once the contracts are frozen.

```text
P0 Requirements
      ↓
P1 UX + Contracts
      ↓
P2 Engineering Foundation
      ↓
P3 Centre Digital Model
      ↓
P4 Dataset + Video
      ↓
P5 Detection
      ↓
P6 Tracking
      ↓
P7 Attendance
      ↓
P8 Attendance Compliance
      ↓
P9 Infrastructure Detection
      ↓
P10 Infrastructure Compliance
      ↓
P11 Alert Engine
      ↓
P12 Evidence + Review
      ↓
P13 Backend Integration
      ↓
P14 Dashboard
      ↓
P15 Edge
      ↓
P16 Offline + Health
      ↓
P17 Privacy + Security
      ↓
P18 Analytics
      ↓
P19 Evaluation
      ↓
P20 Deployment + Demo
```

Parallel work after Phase 1:

```text
AI Team       → P4–P10, P19
Backend Team  → P2–P3, P11–P13
Frontend Team → P1, P12, P14, P18
Edge Team     → P2, P15–P16
Security/QA   → Continuous + P17 + P19
Integration   → Continuous + P20
```

---

# 5. Phase Gates

A phase should be considered complete only when its exit criteria are met.

```text
Requirements Gate
  ↓
Architecture Gate
  ↓
Data Gate
  ↓
Perception Gate
  ↓
Observation Gate
  ↓
Compliance Gate
  ↓
Evidence Gate
  ↓
Product Gate
  ↓
Edge Gate
  ↓
Security Gate
  ↓
Evaluation Gate
  ↓
Deployment Gate
```

Do not move downstream problems upstream under the excuse of "we will fix it in the UI".

For example:

```text
Poor detection
   ≠
Dashboard problem
```

and:

```text
Bad compliance threshold
   ≠
AI model problem
```

Each layer should have its own measurable responsibility.

---

# 6. The Three-Layer Intelligence Model

The system should explicitly separate three types of reasoning.

## Layer 1 — Perception

```text
What is visible?
```

Examples:
- Person detected.
- Machine detected.
- Camera frame received.

## Layer 2 — Operational Observation

```text
What does the scene imply over time?
```

Examples:
- 36 unique people observed during session.
- 17 machines repeatedly observed.
- Camera appears unavailable for 10 minutes.

## Layer 3 — Compliance Decision Support

```text
Does the observation differ from what was expected?
```

Examples:
- Reported attendance exceeds observed attendance by a configured threshold.
- Observed machines are below sanctioned inventory.

The UI should make these layers visually distinguishable.

---

# 7. Innovation Layer

The following ideas should strengthen the system without turning it into an unnecessary research project.

## 7.1 Observation Confidence

Do not expose only detector confidence. Combine:

```text
Detector confidence
+
Track stability
+
Temporal consistency
+
Zone validity
+
Camera health
```

to produce a more useful observation confidence.

---

## 7.2 Temporal Verification

Before creating an alert:

```text
single-frame anomaly
        ↓
repeat observation
        ↓
persistence check
        ↓
camera-health check
        ↓
alert
```

This reduces noisy false positives.

---

## 7.3 Evidence-First Alerts

Instead of:

```text
"Violation detected"
```

show:

```text
What happened
Why it triggered
Where it happened
When it happened
Confidence
Observation window
Evidence
```

---

## 7.4 Centre-Specific Baselines

Each centre can have a different:

```text
capacity
inventory
room layout
camera layout
session schedule
```

The platform should evaluate the centre against its own configuration rather than a single generic template.

---

## 7.5 Adaptive Edge Mode

When connectivity drops:

```text
Good network
→ higher event detail

Weak network
→ compressed metadata

Offline
→ local queue

Recovery
→ prioritized synchronization
```

This makes the low-bandwidth architecture a true operating mode, not just a marketing feature.

---

## 7.6 Camera Trust Layer

Before interpreting an anomaly, ask:

```text
Is the camera healthy enough to support this observation?
```

Example:

```text
AI says: 0 machines
Camera quality: severely obstructed

Result:
UNCERTAIN

Not:
MISSING
```

---

## 7.7 Human-in-the-Loop Learning

When reviewers repeatedly dismiss false alerts, those outcomes can be logged as feedback for future threshold/model improvement.

```text
AI alert
 ↓
Human review
 ↓
Dismissed / confirmed
 ↓
Feedback dataset
 ↓
Future calibration
```

For the hackathon, this can be demonstrated conceptually or with a small feedback table rather than building a full online learning system.

---

# 8. What Not to Build First

Do not spend early hackathon time on:

```text
❌ Facial recognition
❌ Large-scale cloud video storage
❌ Complex predictive AI
❌ Overly broad object taxonomy
❌ Full national-scale infrastructure
❌ Autonomous enforcement decisions
❌ Fancy analytics without reliable observations
```

Build the operational spine first:

```text
Person count
→ attendance discrepancy
→ equipment count
→ infrastructure discrepancy
→ evidence
→ alert
→ human review
```

---

# 9. Definition of Done for the Final Project

The project should be considered complete only when all of the following are true:

### AI
- Person detection works on demo footage.
- Tracking is stable enough for session counting.
- Infrastructure detection works for the selected demo classes.
- Observation confidence is surfaced.

### Compliance
- Reported attendance can be compared with AI attendance.
- Sanctioned inventory can be compared with AI observation.
- Alerts are persistent/temporal rather than single-frame noise.

### Product
- Dashboard is usable end-to-end.
- Alerts expose evidence.
- Review status is recorded.
- Reports/analytics reflect stored events.

### Edge
- Local inference works.
- Metadata/event sync works.
- Offline queue works.
- Recovery synchronization works.

### Reliability
- Camera failure is distinguishable from a quiet room.
- False-positive/false-negative analysis is documented.
- The final test set is not used for ongoing tuning.

### Privacy/Security
- No unnecessary face identification.
- Access is role-controlled.
- Evidence is protected.
- Important actions are auditable.

### Demo
- Clean startup.
- Seeded demo data.
- Deterministic sample footage.
- End-to-end alert workflow.
- Offline scenario.

---

# 10. Final Architecture Mental Model

The complete project should always be explainable using this chain:

```text
CAMERA
  ↓
PERCEPTION
  ├── Person detection
  └── Equipment detection
  ↓
TEMPORAL REASONING
  └── Tracking / persistence
  ↓
OPERATIONAL OBSERVATIONS
  ├── Session attendance
  ├── Infrastructure presence
  └── Camera/device health
  ↓
COMPLIANCE ENGINE
  ├── Reported vs observed attendance
  └── Sanctioned vs observed infrastructure
  ↓
EVENT ENGINE
  └── Alert + severity + confidence
  ↓
EVIDENCE
  └── Snapshot/clip + metadata
  ↓
HUMAN REVIEW
  └── Confirm / dismiss / escalate
  ↓
ANALYTICS + REPORTING
  ↓
AUDITABLE OUTCOME
```

This is the master development roadmap. The other project documents should reference these phases so that the entire repository follows one consistent implementation strategy.
