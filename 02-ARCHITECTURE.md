# System Architecture

## High-level architecture

```text
CCTV / IP Camera
       |
       v
+-----------------------+
| Edge AI Agent         |
| OpenCV                |
| Detector              |
| Tracker               |
| Zone/Session Logic    |
+-----------+-----------+
            |
       Events + Metrics
       + Evidence
            |
            v
+-----------------------+
| API / Backend         |
| Auth + Rules          |
| Compliance Engine     |
| Alert Engine          |
+-----+-----------+-----+
      |           |
      v           v
 PostgreSQL   Object Storage
      |
      v
+-----------------------+
| Monitoring Dashboard  |
| Overview              |
| Centres               |
| Attendance            |
| Infrastructure        |
| Alerts                |
| Evidence Review       |
| Reports               |
+-----------------------+
```

## Recommended stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Map library as required

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy or Supabase client
- WebSockets for live status

### AI
- PyTorch
- OpenCV
- YOLO-family detector
- ByteTrack or equivalent tracker

### Data
- PostgreSQL
- Object storage for limited evidence snapshots/clips
- Redis is optional for queues/caching

### Deployment
- Docker
- GPU-enabled server where available
- Edge workstation/mini-PC/accelerator for centre-side inference

## Data flow

### Attendance

```text
Camera
→ frame sampling
→ person detection
→ tracking
→ classroom ROI filtering
→ session presence logic
→ observed attendance
→ compare with reported attendance
→ alert if confirmed discrepancy
```

### Infrastructure

```text
Camera
→ equipment detection
→ zone filtering
→ temporal confirmation
→ object counts
→ inventory comparison
→ compliance status
→ alert/evidence
```

## Design rule

The cloud should receive structured observations and selected evidence rather than depending on continuous high-resolution video transmission.

## Core event schema

```json
{
  "event_id": "EVT-123",
  "centre_id": "TC-001",
  "camera_id": "CAM-03",
  "event_type": "ATTENDANCE_MISMATCH",
  "severity": "HIGH",
  "timestamp": "2026-10-04T10:32:00+05:30",
  "confidence": 0.91,
  "status": "NEW",
  "evidence_uri": "...",
  "payload": {
    "reported_count": 42,
    "observed_count": 35,
    "difference": 7
  }
}
```
