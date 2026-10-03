import json
import logging
from typing import List, Optional
from fastapi import WebSocket
from sqlalchemy.orm import Session
from backend.models.db_models import ComplianceEvent, AuditLog

logger = logging.getLogger("alert_engine")

class ConnectionManager:
    """Manages active WebSocket connections to broadcast live compliance events."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        text = json.dumps(message, default=str)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(text)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

ws_manager = ConnectionManager()

def trigger_compliance_event(
    db: Session,
    centre_id: str,
    event_type: str,
    severity: str,
    confidence: float,
    payload_dict: dict,
    camera_id: Optional[str] = None,
    room_id: Optional[str] = None,
    evidence_uri: Optional[str] = None
) -> ComplianceEvent:
    """
    Creates and records a compliance event with deduplication of unresolved alerts.
    """
    # Deduplication check: check if an unresolved alert for same centre & event_type already exists within recent window
    existing = db.query(ComplianceEvent).filter(
        ComplianceEvent.centre_id == centre_id,
        ComplianceEvent.event_type == event_type,
        ComplianceEvent.status.in_(["NEW", "UNDER_REVIEW"])
    ).first()

    if existing:
        # Update existing alert severity/confidence/payload rather than spamming duplicate alerts
        existing.severity = severity
        existing.confidence = confidence
        existing.payload_json = json.dumps(payload_dict)
        if evidence_uri:
            existing.evidence_uri = evidence_uri
        db.commit()
        db.refresh(existing)
        return existing

    event = ComplianceEvent(
        centre_id=centre_id,
        camera_id=camera_id,
        room_id=room_id,
        event_type=event_type,
        severity=severity,
        confidence=confidence,
        status="NEW",
        evidence_uri=evidence_uri,
        payload_json=json.dumps(payload_dict)
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Log creation in audit trail
    log = AuditLog(
        actor_id="SYSTEM_ALERT_ENGINE",
        action="CREATE_ALERT",
        entity_type="COMPLIANCE_EVENT",
        entity_id=event.id,
        metadata_json=json.dumps({"severity": severity, "event_type": event_type})
    )
    db.add(log)
    db.commit()

    return event
