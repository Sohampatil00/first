import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from backend.models.db_models import ComplianceEvent, AuditLog
from backend.services.alert_engine import ws_manager
from backend.api.settings import SYSTEM_SETTINGS

logger = logging.getLogger("escalation_service")

class AlertEscalationService:
    """
    Automated Governance Escalation Service (Phase 17 & Phase 3 Compliance):
    Monitors unreviewed or stalled critical compliance events.
    If an event remains unadjudicated past the policy threshold (e.g. 24h, or configured SLA),
    it is automatically escalated to State/National Vigilance Officers with an immutable audit log.
    """

    @staticmethod
    def process_pending_escalations(db: Session, force_hours: float = None) -> List[Dict[str, Any]]:
        """
        Scans for unresolved CRITICAL alerts that exceed the SLA threshold.
        Returns list of escalated alert summaries.
        """
        sla_hours = force_hours if force_hours is not None else float(SYSTEM_SETTINGS.get("auto_escalate_critical_hours", 24))
        cutoff_time = datetime.utcnow() - timedelta(hours=sla_hours)

        # Query unadjudicated critical events older than cutoff
        pending_critical_events = db.query(ComplianceEvent).filter(
            ComplianceEvent.severity == "CRITICAL",
            ComplianceEvent.status.in_(["NEW", "UNDER_REVIEW"]),
            ComplianceEvent.created_at <= cutoff_time
        ).all()

        escalated_records = []

        for event in pending_critical_events:
            prev_status = event.status
            event.status = "ESCALATED_TO_STATE"
            escalation_note = (
                f"[SLA EXCEEDED] Auto-escalated to State Vigilance Directorate. "
                f"Unresolved for >{sla_hours:.1f} hours without adjudication."
            )
            event.review_notes = f"{event.review_notes}\n{escalation_note}" if event.review_notes else escalation_note
            event.reviewed_by = "SYSTEM_ESCALATION_DAEMON"

            # Create immutable audit log
            audit_entry = AuditLog(
                actor_id="SYSTEM_ESCALATION_DAEMON",
                action="AUTO_ESCALATE_ALERT",
                entity_type="COMPLIANCE_EVENT",
                entity_id=event.id,
                metadata_json=json.dumps({
                    "centre_id": event.centre_id,
                    "event_type": event.event_type,
                    "previous_status": prev_status,
                    "new_status": "ESCALATED_TO_STATE",
                    "sla_hours_threshold": sla_hours,
                    "created_at": event.created_at.isoformat() if event.created_at else None
                })
            )
            db.add(audit_entry)

            escalated_records.append({
                "alert_id": event.id,
                "centre_id": event.centre_id,
                "event_type": event.event_type,
                "status": "ESCALATED_TO_STATE",
                "sla_hours": sla_hours
            })

        if escalated_records:
            db.commit()
            logger.info(f"Auto-escalated {len(escalated_records)} critical alerts past {sla_hours}h SLA.")

        return escalated_records
