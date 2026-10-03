# Reusable Development Prompts

## 1. Full-stack lead engineer prompt

```text
You are the lead engineer building an AI-Based Real-Time Monitoring Platform for government-funded training centres.

Build production-oriented, modular code for:
- centre/camera management
- privacy-preserving person counting and tracking
- attendance discrepancy detection
- sanctioned infrastructure detection and comparison
- event/alert generation
- evidence snapshots
- monitoring dashboard
- low-bandwidth edge processing
- offline event queue and synchronization

Use Next.js + TypeScript for frontend, FastAPI + Python for backend, PostgreSQL/Supabase for data, OpenCV + a YOLO-family detector + ByteTrack for vision.

Do not introduce facial identification by default. Use temporary tracking IDs only. Treat AI results as observations that require human review before consequential action.

Every generated feature must include validation, error handling, clear types, loading/empty/error states, and tests where practical.
```

## 2. Backend prompt

```text
Implement the FastAPI backend for the training-centre monitoring system.
Create typed REST endpoints for centres, cameras, inventory, attendance, AI observations, compliance events, alerts and reports.
Use PostgreSQL/Supabase.
Add RBAC-aware authorization, Pydantic validation, structured errors, audit logs and OpenAPI-friendly schemas.
Never store secrets in source code.
Return structured event payloads that can be consumed by a Next.js dashboard.
```

## 3. AI attendance prompt

```text
Implement a privacy-preserving attendance estimation pipeline.
Input: image/video stream.
Steps: person detection → multi-object tracking → configured classroom ROI filtering → dwell-time threshold → session-level observed attendance.
Do not perform facial recognition or name matching.
Avoid double counting by using tracker IDs.
Expose observed count, confidence, timestamp, session ID and camera ID.
Make thresholds configurable.
Add tests for entry/exit, occlusion and crowded-room cases.
```

## 4. Infrastructure compliance prompt

```text
Implement an infrastructure compliance engine for training centres.
Each centre has a sanctioned inventory with item_type and required_quantity.
Input consists of time-windowed object detections.
Aggregate observations, distinguish PRESENT / UNCERTAIN / NOT_OBSERVED, compare with sanctioned quantities and emit a compliance event when a gap is persistent enough.
Do not claim mechanical functionality from video alone. Use wording such as apparently active/inactive when visual activity cues exist.
Return evidence metadata and confidence.
```

## 5. Alert engine prompt

```text
Build an event-driven compliance alert engine.
Input: attendance and infrastructure observations.
Use configurable tolerance and temporal confirmation to reduce noisy alerts.
Emit ATTENDANCE_MISMATCH, INFRASTRUCTURE_GAP, CAMERA_OFFLINE, CAMERA_OBSTRUCTED and LOW_CONFIDENCE_OBSERVATION events.
Every event must contain centre_id, camera_id where applicable, timestamp, severity, confidence, structured payload, evidence reference and status.
Support NEW, UNDER_REVIEW, CONFIRMED, DISMISSED and RESOLVED states.
```

## 6. Edge/offline prompt

```text
Build a Python edge agent that reads RTSP/video input, runs local inference, generates structured observations and syncs only events/metrics/evidence to the cloud.
Implement local SQLite persistence or a durable queue for offline mode.
When network connectivity returns, batch-sync with idempotent event IDs and retry with exponential backoff.
Expose camera health metrics.
Keep the cloud independent from continuous video transport.
```

## 7. Dashboard prompt

```text
Build the complete Next.js monitoring dashboard for government training-centre compliance.
Pages: Overview, Centres, Centre Detail, Cameras, Attendance, Infrastructure, Alerts, Alert Detail/Evidence Review, Reports, Settings.
Use a credible GovTech/enterprise visual language: dense but readable data tables, clear status chips, strong information hierarchy, accessible contrast and restrained motion.
Support desktop-first operation with responsive layouts.
Every page needs loading, empty, error and success states.
```

## 8. Code-review prompt

```text
Review this implementation as a senior architect.
Check correctness, privacy risks, false-alert behavior, performance, concurrency, database indexing, security, API design, edge/offline reliability, observability and maintainability.
List concrete defects first, then provide minimal patches.
Do not rewrite working components without a technical reason.
```
