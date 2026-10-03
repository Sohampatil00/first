from datetime import datetime, timedelta
from typing import List, Tuple
from sqlalchemy.orm import Session
from backend.models.db_models import Camera

def check_stale_cameras(db: Session, timeout_seconds: int = 60) -> List[Camera]:
    """
    Finds cameras that have not reported a heartbeat within timeout_seconds.
    Updates their status to OFFLINE.
    """
    cutoff = datetime.utcnow() - timedelta(seconds=timeout_seconds)
    stale_cameras = db.query(Camera).filter(
        Camera.status == "ONLINE",
        Camera.last_seen_at < cutoff
    ).all()

    for cam in stale_cameras:
        cam.status = "OFFLINE"
    
    if stale_cameras:
        db.commit()

    return stale_cameras

def record_camera_heartbeat(db: Session, camera_id: str, status: str = "ONLINE") -> Camera:
    """Updates camera heartbeat timestamp and status."""
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if cam:
        cam.last_seen_at = datetime.utcnow()
        cam.status = status
        db.commit()
        db.refresh(cam)
    return cam
