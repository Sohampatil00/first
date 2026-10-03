import json
import time
import base64
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.db.session import get_db
from backend.models.db_models import (
    AIAttendanceObservation, InfrastructureObservation, 
    ReportedAttendance, SanctionedInventory, ComplianceEvent
)
from backend.models.schemas import (
    AIAttendanceObservationCreate, AIAttendanceObservationResponse,
    InfrastructureObservationCreate, InfrastructureObservationResponse,
    ComplianceEventCreate, ComplianceEventResponse
)
from backend.services.compliance import evaluate_attendance_discrepancy, evaluate_infrastructure_compliance
from backend.services.alert_engine import trigger_compliance_event, ws_manager

router = APIRouter(prefix="/api/ai", tags=["AI Telemetry & Observations"])

# Shared YOLO model for live webcam frames
_webcam_yolo_model = None

def get_webcam_yolo():
    global _webcam_yolo_model
    if _webcam_yolo_model is None:
        from ultralytics import YOLO
        _webcam_yolo_model = YOLO("yolov8n.pt")
    return _webcam_yolo_model

class WebcamFramePayload(BaseModel):
    image_base64: str
    centre_id: str = "TC-101"
    camera_id: str = "CAM-101-A1"
    room_id: str = "ROOM-101-A"
    reconcile: bool = False

@router.post("/webcam/infer")
async def process_webcam_frame(
    payload: WebcamFramePayload,
    db: Session = Depends(get_db)
):
    start_t = time.time()
    try:
        img_str = payload.image_base64
        if "," in img_str:
            img_str = img_str.split(",", 1)[1]
        img_bytes = base64.b64decode(img_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image frame")
        
        h, w = frame.shape[:2]
        model = get_webcam_yolo()
        results = model(frame, verbose=False, conf=0.3)[0]

        detections = []
        person_count = 0
        computer_count = 0
        blur_boxes = []

        for box in results.boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            xyxy = [float(v) for v in box.xyxy[0].tolist()]

            norm_box = [xyxy[0]/w, xyxy[1]/h, xyxy[2]/w, xyxy[3]/h]

            if cls_name == "person":
                person_count += 1
                detections.append({
                    "class_name": "person",
                    "label": f"Trainee ({int(conf*100)}%)",
                    "confidence": round(conf, 2),
                    "box": norm_box
                })
                head_y2 = xyxy[1] + (xyxy[3] - xyxy[1]) * 0.35
                blur_boxes.append([xyxy[0]/w, xyxy[1]/h, xyxy[2]/w, head_y2/h])
            elif cls_name in ["laptop", "tv", "cell phone"]:
                computer_count += 1
                detections.append({
                    "class_name": "computer",
                    "label": f"Computer ({int(conf*100)}%)",
                    "confidence": round(conf, 2),
                    "box": norm_box
                })
            elif cls_name in ["chair", "bench", "couch"]:
                detections.append({
                    "class_name": "chair",
                    "label": f"Workstation Chair ({int(conf*100)}%)",
                    "confidence": round(conf, 2),
                    "box": norm_box
                })

        latency_ms = int((time.time() - start_t) * 1000)

        alert_triggered = False
        alert_id = None

        if payload.reconcile:
            latest_reported = db.query(ReportedAttendance).filter(
                ReportedAttendance.centre_id == payload.centre_id
            ).order_by(ReportedAttendance.created_at.desc()).first()

            if latest_reported:
                status, severity, p_dict = evaluate_attendance_discrepancy(
                    reported=latest_reported.reported_count,
                    observed=person_count
                )
                if severity in ["REVIEW", "HIGH", "CRITICAL"]:
                    import uuid
                    annotated = frame.copy()
                    for b in blur_boxes:
                        bx1, by1, bx2, by2 = int(b[0]*w), int(b[1]*h), int(b[2]*w), int(b[3]*h)
                        bx1, by1 = max(0, bx1), max(0, by1)
                        bx2, by2 = min(w, bx2), min(h, by2)
                        if (by2 - by1) > 4 and (bx2 - bx1) > 4:
                            annotated[by1:by2, bx1:bx2] = cv2.GaussianBlur(annotated[by1:by2, bx1:bx2], (31, 31), 30)

                    snap_filename = f"webcam_{payload.centre_id}_{int(time.time())}.jpg"
                    snap_path = f"evidence_storage/{snap_filename}"
                    cv2.imwrite(snap_path, annotated)

                    event = trigger_compliance_event(
                        db=db,
                        centre_id=payload.centre_id,
                        camera_id=payload.camera_id,
                        room_id=payload.room_id,
                        event_type="ATTENDANCE_MISMATCH",
                        severity=severity,
                        confidence=0.92,
                        payload_dict=p_dict,
                        evidence_uri=f"/api/evidence/{snap_filename}"
                    )
                    alert_triggered = True
                    alert_id = event.id
                    await ws_manager.broadcast({
                        "type": "NEW_ALERT",
                        "event_id": event.id,
                        "centre_id": event.centre_id,
                        "event_type": event.event_type,
                        "severity": event.severity,
                        "payload": p_dict
                    })

        return {
            "status": "SUCCESS",
            "person_count": person_count,
            "computer_count": computer_count,
            "detections": detections,
            "blur_boxes": blur_boxes,
            "latency_ms": latency_ms,
            "alert_triggered": alert_triggered,
            "alert_id": alert_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/observations/attendance")
async def ingest_attendance_observation(
    obs_in: AIAttendanceObservationCreate, 
    db: Session = Depends(get_db)
):
    obs_data = obs_in.model_dump()
    evidence_uri = obs_data.pop("evidence_uri", None)
    obs = AIAttendanceObservation(**obs_data)
    db.add(obs)
    db.commit()
    db.refresh(obs)

    # Reconcile against reported attendance
    latest_reported = db.query(ReportedAttendance).filter(
        ReportedAttendance.centre_id == obs_in.centre_id,
        ReportedAttendance.session_date == obs_in.session_date
    ).order_by(ReportedAttendance.created_at.desc()).first()

    alert_created = None
    if latest_reported:
        status, severity, payload = evaluate_attendance_discrepancy(
            reported=latest_reported.reported_count,
            observed=obs_in.observed_count
        )
        if severity in ["REVIEW", "HIGH", "CRITICAL"]:
            event = trigger_compliance_event(
                db=db,
                centre_id=obs_in.centre_id,
                camera_id=obs_in.camera_id,
                room_id=obs_in.room_id,
                event_type="ATTENDANCE_MISMATCH",
                severity=severity,
                confidence=obs_in.observation_confidence,
                payload_dict=payload,
                evidence_uri=evidence_uri
            )
            alert_created = event.id
            await ws_manager.broadcast({
                "type": "NEW_ALERT",
                "event_id": event.id,
                "centre_id": event.centre_id,
                "event_type": event.event_type,
                "severity": event.severity,
                "payload": payload
            })

    return {
        "observation_id": obs.id,
        "status": "PROCESSED",
        "alert_triggered": alert_created is not None,
        "alert_id": alert_created
    }

@router.post("/observations/infrastructure")
async def ingest_infrastructure_observation(
    obs_in: InfrastructureObservationCreate,
    db: Session = Depends(get_db)
):
    # Store infrastructure observation
    obs = InfrastructureObservation(**obs_in.model_dump())
    db.add(obs)
    db.commit()
    db.refresh(obs)

    # Check against sanctioned inventory
    sanctioned = db.query(SanctionedInventory).filter(
        SanctionedInventory.centre_id == obs_in.centre_id,
        SanctionedInventory.item_type == obs_in.item_type,
        SanctionedInventory.active == True
    ).first()

    alert_created = None
    if sanctioned:
        status, severity, payload = evaluate_infrastructure_compliance(
            sanctioned=sanctioned.required_quantity,
            observed=obs_in.observed_quantity,
            item_type=obs_in.item_type
        )
        if severity in ["REVIEW", "HIGH", "CRITICAL"]:
            event = trigger_compliance_event(
                db=db,
                centre_id=obs_in.centre_id,
                camera_id=obs_in.camera_id,
                event_type="INFRASTRUCTURE_GAP",
                severity=severity,
                confidence=obs_in.confidence,
                payload_dict=payload
            )
            alert_created = event.id
            await ws_manager.broadcast({
                "type": "NEW_ALERT",
                "event_id": event.id,
                "centre_id": event.centre_id,
                "event_type": event.event_type,
                "severity": event.severity,
                "payload": payload
            })

    return {
        "observation_id": obs.id,
        "status": "PROCESSED",
        "alert_triggered": alert_created is not None,
        "alert_id": alert_created
    }

@router.post("/events", response_model=ComplianceEventResponse)
async def ingest_direct_event(
    event_in: ComplianceEventCreate,
    db: Session = Depends(get_db)
):
    payload_dict = json.loads(event_in.payload_json) if event_in.payload_json else {}
    event = trigger_compliance_event(
        db=db,
        centre_id=event_in.centre_id,
        camera_id=event_in.camera_id,
        room_id=event_in.room_id,
        event_type=event_in.event_type,
        severity=event_in.severity,
        confidence=event_in.confidence,
        payload_dict=payload_dict,
        evidence_uri=event_in.evidence_uri
    )
    await ws_manager.broadcast({
        "type": "NEW_ALERT",
        "event_id": event.id,
        "centre_id": event.centre_id,
        "event_type": event.event_type,
        "severity": event.severity
    })
    return event
