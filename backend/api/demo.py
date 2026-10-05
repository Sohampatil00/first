import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.models.db_models import ReportedAttendance
from backend.services.alert_engine import trigger_compliance_event, ws_manager
from backend.db.seed import seed_database

router = APIRouter(prefix="/api/demo", tags=["Demo Controller"])

@router.post("/trigger-scenario")
async def trigger_demo_scenario(scenario: str, db: Session = Depends(get_db)):
    """
    Executes one of the 16-step demo scenarios on demand:
    - ATTENDANCE_DISCREPANCY: Generates 40% attendance gap
    - INFRASTRUCTURE_GAP: Generates missing equipment gap
    - CAMERA_OFFLINE: Simulates camera disconnection
    - RESET: Resets database to clean state
    """
    if scenario == "RESET":
        seed_database()
        await ws_manager.broadcast({"type": "DEMO_RESET", "message": "Demo data reset to baseline."})
        return {"status": "SUCCESS", "scenario": "RESET", "message": "Database reset to baseline."}

    elif scenario == "ATTENDANCE_DISCREPANCY":
        payload = {
            "reported": 20,
            "reported_count": 20,
            "observed": 12,
            "observed_count": 12,
            "difference": 8,
            "absolute_difference": 8,
            "relative_difference_pct": 40.0,
            "tolerance_threshold_pct": 15.0,
            "dwell_threshold_seconds": 180
        }
        event = trigger_compliance_event(
            db=db,
            centre_id="TC-101",
            camera_id="CAM-101-A1",
            room_id="ROOM-101-A",
            event_type="ATTENDANCE_MISMATCH",
            severity="HIGH",
            confidence=0.94,
            payload_dict=payload,
            evidence_uri="/api/evidence/demo_attendance_evidence.jpg"
        )
        await ws_manager.broadcast({
            "type": "NEW_ALERT",
            "event_id": event.id,
            "centre_id": event.centre_id,
            "event_type": event.event_type,
            "severity": event.severity,
            "payload": payload
        })
        return {"status": "SUCCESS", "event_id": event.id, "type": "ATTENDANCE_MISMATCH"}

    elif scenario == "INFRASTRUCTURE_GAP":
        payload = {
            "item_type": "computer",
            "required": 20,
            "sanctioned_quantity": 20,
            "observed": 17,
            "observed_quantity": 17,
            "gap": 3,
            "difference": 3,
            "relative_difference_pct": 15.0
        }
        event = trigger_compliance_event(
            db=db,
            centre_id="TC-101",
            camera_id="CAM-101-A1",
            room_id="ROOM-101-A",
            event_type="INFRASTRUCTURE_GAP",
            severity="HIGH",
            confidence=0.91,
            payload_dict=payload,
            evidence_uri="/api/evidence/demo_inventory_evidence.jpg"
        )
        await ws_manager.broadcast({
            "type": "NEW_ALERT",
            "event_id": event.id,
            "centre_id": event.centre_id,
            "event_type": event.event_type,
            "severity": event.severity,
            "payload": payload
        })
        return {"status": "SUCCESS", "event_id": event.id, "type": "INFRASTRUCTURE_GAP"}

    elif scenario == "CAMERA_OFFLINE":
        payload = {
            "offline_duration_minutes": 45,
            "last_heartbeat": datetime.utcnow().isoformat(),
            "spool_buffered_events": 34,
            "network_status": "DISCONNECTED"
        }
        event = trigger_compliance_event(
            db=db,
            centre_id="TC-103",
            camera_id="CAM-103-A1",
            room_id="ROOM-103-A",
            event_type="CAMERA_OFFLINE",
            severity="CRITICAL",
            confidence=1.0,
            payload_dict=payload,
            evidence_uri="/api/evidence/demo_camera_offline_evidence.jpg"
        )
        await ws_manager.broadcast({
            "type": "NEW_ALERT",
            "event_id": event.id,
            "centre_id": event.centre_id,
            "event_type": event.event_type,
            "severity": event.severity,
            "payload": payload
        })
        return {"status": "SUCCESS", "event_id": event.id, "type": "CAMERA_OFFLINE"}

    elif scenario == "CAMERA_OBSTRUCTED":
        payload = {
            "optical_variance": 7.4,
            "threshold": 35.0,
            "tamper_type": "LENS_OCCLUSION_OR_BLUR",
            "uncertainty_flag": True
        }
        event = trigger_compliance_event(
            db=db,
            centre_id="TC-103",
            camera_id="CAM-103-B1",
            room_id="ROOM-103-B",
            event_type="CAMERA_OBSTRUCTED",
            severity="HIGH",
            confidence=0.96,
            payload_dict=payload,
            evidence_uri="/api/evidence/demo_camera_tamper_evidence.jpg"
        )
        await ws_manager.broadcast({
            "type": "NEW_ALERT",
            "event_id": event.id,
            "centre_id": event.centre_id,
            "event_type": event.event_type,
            "severity": event.severity,
            "payload": payload
        })
        return {"status": "SUCCESS", "event_id": event.id, "type": "CAMERA_OBSTRUCTED"}

    return {"status": "ERROR", "message": f"Unknown scenario: {scenario}"}
