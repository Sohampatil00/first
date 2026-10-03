import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.session import get_db
from backend.models.db_models import ComplianceEvent, AuditLog, ReviewFeedback
from backend.models.schemas import ComplianceEventResponse, ComplianceEventReviewUpdate, ReviewFeedbackResponse
from backend.services.alert_engine import ws_manager

router = APIRouter(prefix="/api/alerts", tags=["Compliance Alerts & Evidence Review"])

@router.get("", response_model=List[ComplianceEventResponse])
def list_alerts(
    centre_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(ComplianceEvent)
    if centre_id:
        query = query.filter(ComplianceEvent.centre_id == centre_id)
    if status:
        query = query.filter(ComplianceEvent.status == status)
    if severity:
        query = query.filter(ComplianceEvent.severity == severity)
    return query.order_by(ComplianceEvent.created_at.desc()).limit(limit).all()

@router.get("/{alert_id}", response_model=ComplianceEventResponse)
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    event = db.query(ComplianceEvent).filter(ComplianceEvent.id == alert_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Compliance alert not found")
    return event

@router.patch("/{alert_id}/review", response_model=ComplianceEventResponse)
async def review_alert(
    alert_id: str, 
    review: ComplianceEventReviewUpdate, 
    db: Session = Depends(get_db)
):
    event = db.query(ComplianceEvent).filter(ComplianceEvent.id == alert_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Compliance alert not found")
    
    old_status = event.status
    event.status = review.status
    event.review_notes = review.review_notes
    event.reviewed_by = review.reviewed_by
    if review.status in ["RESOLVED", "CONFIRMED", "DISMISSED"]:
        event.resolved_at = datetime.utcnow()

    # Create immutable audit log entry
    audit = AuditLog(
        actor_id=review.reviewed_by,
        action=f"REVIEW_ALERT_{review.status}",
        entity_type="COMPLIANCE_EVENT",
        entity_id=event.id,
        metadata_json=json.dumps({
            "previous_status": old_status,
            "new_status": review.status,
            "category": review.category,
            "review_notes": review.review_notes
        })
    )
    db.add(audit)

    # Record structured feedback for Active Learning & Model Calibration (Phases 12, 19, 20)
    if review.status in ["CONFIRMED", "DISMISSED"]:
        category = review.category or ("CONFIRMED_VIOLATION" if review.status == "CONFIRMED" else "DISMISSED_EXCEPTION")
        recalibration_flag = (
            "RETRAIN_DETECTOR" if "GLARE" in category or "LIGHTING" in category else (
                "TUNE_DWELL" if "EARLY" in category else (
                    "RECALIBRATE_ROI" if "OCCLUSION" in category else "NONE"
                )
            )
        )
        feedback = ReviewFeedback(
            event_id=event.id,
            centre_id=event.centre_id,
            decision=review.status,
            category=category,
            notes=review.review_notes,
            reviewed_by=review.reviewed_by,
            model_recalibration_flag=recalibration_flag
        )
        db.add(feedback)

    db.commit()
    db.refresh(event)

    # Broadcast status change to live dashboard
    await ws_manager.broadcast({
        "type": "ALERT_STATUS_UPDATED",
        "event_id": event.id,
        "status": event.status,
        "reviewed_by": event.reviewed_by
    })

    return event

@router.get("/feedback/list", response_model=List[ReviewFeedbackResponse])
def list_review_feedback(limit: int = 100, db: Session = Depends(get_db)):
    """Returns historical reviewer feedback and root-cause annotations for model calibration."""
    return db.query(ReviewFeedback).order_by(ReviewFeedback.created_at.desc()).limit(limit).all()

@router.get("/feedback/export-csv")
def export_feedback_csv(db: Session = Depends(get_db)):
    """Streams active learning calibration dataset in CSV format."""
    from fastapi.responses import Response
    import io
    import csv

    feedbacks = db.query(ReviewFeedback).order_by(ReviewFeedback.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "feedback_id", "event_id", "centre_id", "decision", 
        "root_cause_category", "notes", "reviewed_by", 
        "model_recalibration_flag", "timestamp"
    ])

    for f in feedbacks:
        writer.writerow([
            f.id, f.event_id, f.centre_id, f.decision,
            f.category, f.notes or "", f.reviewed_by,
            f.model_recalibration_flag, f.created_at.isoformat() if f.created_at else ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=centrewatch_active_learning_feedback.csv"}
    )


@router.post("/escalate-pending")
async def trigger_sla_escalations(
    force_hours: Optional[float] = Query(None, description="Override SLA hours for testing"),
    db: Session = Depends(get_db)
):
    """
    Evaluates unreviewed critical compliance alerts against the governance SLA threshold.
    Any alerts exceeding the threshold are automatically escalated to State Vigilance.
    """
    from backend.services.escalation import AlertEscalationService
    escalated = AlertEscalationService.process_pending_escalations(db, force_hours=force_hours)
    
    if escalated:
        await ws_manager.broadcast({
            "type": "ALERTS_AUTO_ESCALATED",
            "count": len(escalated),
            "escalated": escalated
        })

    return {
        "status": "SUCCESS",
        "escalated_count": len(escalated),
        "escalated_records": escalated
    }

