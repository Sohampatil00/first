from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db.session import get_db
from backend.models.db_models import ReportedAttendance
from backend.models.schemas import ReportedAttendanceCreate, ReportedAttendanceResponse

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/reported", response_model=ReportedAttendanceResponse)
def report_attendance(att_in: ReportedAttendanceCreate, db: Session = Depends(get_db)):
    record = ReportedAttendance(**att_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/{centre_id}", response_model=List[ReportedAttendanceResponse])
def get_centre_reported_attendance(centre_id: str, db: Session = Depends(get_db)):
    return db.query(ReportedAttendance).filter(ReportedAttendance.centre_id == centre_id).order_by(ReportedAttendance.created_at.desc()).all()
