from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.db.session import get_db
from backend.models.db_models import Camera
from backend.models.schemas import CameraCreate, CameraResponse, CameraHealthUpdate

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraResponse])
def list_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()

@router.post("", response_model=CameraResponse)
def register_camera(camera_in: CameraCreate, db: Session = Depends(get_db)):
    existing = db.query(Camera).filter(Camera.id == camera_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Camera ID already exists")
    cam = Camera(**camera_in.model_dump())
    db.add(cam)
    db.commit()
    db.refresh(cam)
    return cam

@router.post("/{camera_id}/heartbeat", response_model=CameraResponse)
def update_camera_heartbeat(camera_id: str, health: CameraHealthUpdate, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    cam.status = health.status
    cam.last_seen_at = health.last_seen_at or datetime.utcnow()
    db.commit()
    db.refresh(cam)
    return cam
