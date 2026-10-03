import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.session import get_db
from backend.models.db_models import ComplianceEvent, AuditLog
from backend.models.schemas import ComplianceEventResponse, ComplianceEventReviewUpdate
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
            "review_notes": review.review_notes
        })
    )
    db.add(audit)
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

