import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
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
