import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Centre(Base):
    __tablename__ = "centres"

    id = Column(String, primary_key=True, index=True)  # e.g., "TC-101"
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    district = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    sanctioned_capacity = Column(Integer, default=30)
    status = Column(String, default="ACTIVE")  # ACTIVE, INACTIVE, FLAG_REVIEW
    created_at = Column(DateTime, default=datetime.utcnow)

    rooms = relationship("Room", back_populates="centre", cascade="all, delete-orphan")
    cameras = relationship("Camera", back_populates="centre", cascade="all, delete-orphan")
    inventory = relationship("SanctionedInventory", back_populates="centre", cascade="all, delete-orphan")
    events = relationship("ComplianceEvent", back_populates="centre", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, default=generate_uuid)
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    name = Column(String, nullable=False)  # e.g. "Classroom 1", "Automotive Lab"
    room_type = Column(String, nullable=False)  # CLASSROOM, WORKSHOP, LAB
    capacity = Column(Integer, default=30)
    roi_polygon_json = Column(Text, nullable=True)  # JSON points defining ROI coordinates
    created_at = Column(DateTime, default=datetime.utcnow)

    centre = relationship("Centre", back_populates="rooms")
    cameras = relationship("Camera", back_populates="room")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True)  # e.g., "CAM-101-A"
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    name = Column(String, nullable=False)
    source_type = Column(String, default="RTSP")  # RTSP, WEBCAM, FILE_SIMULATION
    stream_url = Column(String, nullable=True)
    status = Column(String, default="ONLINE")  # ONLINE, OFFLINE, OBSTRUCTED
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    centre = relationship("Centre", back_populates="cameras")
    room = relationship("Room", back_populates="cameras")

class SanctionedInventory(Base):
    __tablename__ = "sanctioned_inventory"

    id = Column(String, primary_key=True, default=generate_uuid)
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    item_type = Column(String, nullable=False)  # "computer", "sewing_machine", "workbench", etc.
    required_quantity = Column(Integer, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    centre = relationship("Centre", back_populates="inventory")

class ReportedAttendance(Base):
    __tablename__ = "reported_attendance"

    id = Column(String, primary_key=True, default=generate_uuid)
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    session_date = Column(String, nullable=False)  # YYYY-MM-DD
    session_start = Column(String, nullable=False) # HH:MM
    session_end = Column(String, nullable=False)   # HH:MM
    reported_count = Column(Integer, nullable=False)
    source = Column(String, default="CENTRE_PORTAL") # PORTAL, BIOMETRIC, MANUAL
    created_at = Column(DateTime, default=datetime.utcnow)

class AIAttendanceObservation(Base):
    __tablename__ = "ai_attendance_observations"

    id = Column(String, primary_key=True, default=generate_uuid)
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    session_date = Column(String, nullable=False)
    observed_count = Column(Integer, nullable=False)
    observation_confidence = Column(Float, default=0.95)
    dwell_threshold_seconds = Column(Integer, default=180)
    observation_window_start = Column(DateTime, nullable=False)
    observation_window_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class InfrastructureObservation(Base):
    __tablename__ = "infrastructure_observations"

    id = Column(String, primary_key=True, default=generate_uuid)
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False, index=True)
    item_type = Column(String, nullable=False)
    required_quantity = Column(Integer, default=0)
    observed_quantity = Column(Integer, nullable=False)
    confidence = Column(Float, default=0.90)
    state = Column(String, default="PRESENT")  # PRESENT, NOT_OBSERVED, UNCERTAIN, APPARENTLY_ACTIVE
    created_at = Column(DateTime, default=datetime.utcnow)

class ComplianceEvent(Base):
    __tablename__ = "compliance_events"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    centre_id = Column(String, ForeignKey("centres.id"), nullable=False, index=True)
    camera_id = Column(String, nullable=True)
    room_id = Column(String, nullable=True)
    event_type = Column(String, nullable=False, index=True) # ATTENDANCE_MISMATCH, INFRASTRUCTURE_GAP, CAMERA_OFFLINE, CAMERA_OBSTRUCTED
    severity = Column(String, nullable=False) # NORMAL, REVIEW, HIGH, CRITICAL
    confidence = Column(Float, default=0.85)
    status = Column(String, default="NEW", index=True) # NEW, UNDER_REVIEW, CONFIRMED, DISMISSED, RESOLVED
    evidence_uri = Column(String, nullable=True) # URL or path to snapshot
    payload_json = Column(Text, nullable=True) # JSON details (e.g. reported vs observed)
    review_notes = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    centre = relationship("Centre", back_populates="events")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    actor_id = Column(String, nullable=False) # e.g. "OFFICER_PATIL" or "SYSTEM_ALERT_ENGINE"
    action = Column(String, nullable=False)   # CONFIRM_ALERT, DISMISS_ALERT, ESCALATE, UPDATE_INVENTORY
    entity_type = Column(String, nullable=False) # COMPLIANCE_EVENT, CENTRE, INVENTORY
    entity_id = Column(String, nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
