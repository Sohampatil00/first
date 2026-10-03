import json
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.models.db_models import AuditLog

router = APIRouter(prefix="/api/settings", tags=["Policy & Governance Settings"])

# In-memory runtime configuration with persistence to audit logs
SYSTEM_SETTINGS = {
    "attendance_tolerance_pct": 15.0,
    "dwell_time_seconds": 180,
    "asset_gap_threshold": 1,
    "privacy_blur_mode": "GAUSSIAN_FACE_MASK",
    "evidence_retention_days": 90,
    "auto_escalate_critical_hours": 24
}

class SettingsUpdate(BaseModel):
    attendance_tolerance_pct: float
    dwell_time_seconds: int
    asset_gap_threshold: int
    privacy_blur_mode: str
    evidence_retention_days: int
    auto_escalate_critical_hours: int
    modified_by: str = "MINISTRY_OFFICER"

@router.get("")
def get_settings():
    return SYSTEM_SETTINGS

@router.post("")
def update_settings(update: SettingsUpdate, db: Session = Depends(get_db)):
    global SYSTEM_SETTINGS
    old_settings = SYSTEM_SETTINGS.copy()
    SYSTEM_SETTINGS.update(update.model_dump(exclude={"modified_by"}))

    # Log policy change in immutable audit trail
    audit = AuditLog(
        actor_id=update.modified_by,
        action="UPDATE_GOVERNANCE_POLICY",
        entity_type="SYSTEM_SETTINGS",
        entity_id="GLOBAL",
        metadata_json=json.dumps({
            "previous": old_settings,
            "new": SYSTEM_SETTINGS
        })
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "settings": SYSTEM_SETTINGS,
        "message": "Policy parameters updated and recorded in audit log."
    }
