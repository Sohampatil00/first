# Implementation Specification

## Repository

```text
training-centre-ai/
├── frontend/
├── backend/
├── ai/
├── edge/
├── datasets/
├── models/
├── docs/
└── docker-compose.yml
```

## Backend modules

```text
backend/
├── main.py
├── api/
│   ├── auth.py
│   ├── centres.py
│   ├── cameras.py
│   ├── attendance.py
│   ├── infrastructure.py
│   ├── alerts.py
│   └── reports.py
├── services/
│   ├── compliance.py
│   ├── alert_engine.py
│   ├── evidence.py
│   └── camera_health.py
├── models/
└── db/
```

## AI modules

```text
ai/
├── detection/
├── tracking/
├── attendance/
├── infrastructure/
├── compliance/
└── inference.py
```

## API surface

### Centres

```http
POST /api/centres
GET /api/centres
GET /api/centres/{centre_id}
PATCH /api/centres/{centre_id}
```

### Cameras

```http
POST /api/cameras
GET /api/cameras
PATCH /api/cameras/{camera_id}
GET /api/cameras/{camera_id}/health
```

### Attendance

```http
POST /api/attendance/reported
GET /api/attendance/{centre_id}
GET /api/attendance/{centre_id}/sessions
```

### AI observations

```http
POST /api/ai/observations
POST /api/ai/events
```

### Alerts

```http
GET /api/alerts
GET /api/alerts/{alert_id}
PATCH /api/alerts/{alert_id}
```

### Analytics/reports

```http
GET /api/analytics/overview
GET /api/analytics/centre/{centre_id}
GET /api/reports/daily
```

## Database tables

### centres
- id
- name
- location
- district
- state
- sanctioned_capacity
- status
- created_at

### cameras
- id
- centre_id
- room_id
- name
- source_type
- stream_url_encrypted
- status
- last_seen_at

### inventory
- id
- centre_id
- item_type
- required_quantity
- active

### attendance_records
- id
- centre_id
- session_date
- session_start
- session_end
- reported_count
- source

### ai_attendance
- id
- centre_id
- camera_id
- session_id
- observed_count
- observation_confidence
- created_at

### infrastructure_observations
- id
- centre_id
- camera_id
- item_type
- required_quantity
- observed_quantity
- confidence
- state
- created_at

### compliance_events
- id
- centre_id
- camera_id
- type
- severity
- confidence
- status
- evidence_uri
- payload_json
- created_at
- resolved_at

### audit_logs
- id
- actor_id
- action
- entity_type
- entity_id
- metadata_json
- created_at

## Attendance algorithm

```text
1. Detect person.
2. Track person across frames.
3. Check whether track intersects configured classroom ROI.
4. Measure dwell duration.
5. Count the track once when dwell threshold is crossed.
6. Aggregate per session.
7. Compare to reported attendance.
8. Apply configurable tolerance.
9. Require temporal confirmation before creating alert.
```

## Infrastructure algorithm

```text
1. Detect equipment classes.
2. Restrict detections to configured room/zone.
3. Track objects where practical.
4. Aggregate observations over a time window.
5. Mark objects as PRESENT / UNCERTAIN / NOT OBSERVED.
6. Compare against sanctioned inventory.
7. Produce compliance result.
8. Generate evidence when a gap persists.
```

## Alert severity example

```text
NORMAL    no actionable discrepancy
REVIEW    small or uncertain anomaly
HIGH      sustained material discrepancy
CRITICAL  repeated/sustained anomaly requiring immediate human review
```

Thresholds must be configurable and should not be hard-coded as a universal government policy.

## Frontend routes

```text
/dashboard
/centres
/centres/[id]
/attendance
/infrastructure
/alerts
/alerts/[id]
/cameras
/reports
/settings
```
