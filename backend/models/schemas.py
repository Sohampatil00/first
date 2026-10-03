from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Centre Schemas ---
class CentreBase(BaseModel):
    name: str
    location: str
    district: str
    state: str
    sanctioned_capacity: int = 30
    status: str = "ACTIVE"

class CentreCreate(CentreBase):
    id: str

class CentreResponse(CentreBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Room Schemas ---
class RoomBase(BaseModel):
    name: str
    room_type: str
    capacity: int = 30
    roi_polygon_json: Optional[str] = None

class RoomCreate(RoomBase):
    centre_id: str

class RoomResponse(RoomBase):
    id: str
    centre_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Camera Schemas ---
class CameraBase(BaseModel):
    name: str
    source_type: str = "RTSP"
    stream_url: Optional[str] = None
    status: str = "ONLINE"

class CameraCreate(CameraBase):
    id: str
    centre_id: str
    room_id: Optional[str] = None

class CameraHealthUpdate(BaseModel):
    status: str  # ONLINE, OFFLINE, OBSTRUCTED
    last_seen_at: Optional[datetime] = None

class CameraResponse(CameraBase):
    id: str
    centre_id: str
    room_id: Optional[str] = None
    last_seen_at: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Inventory Schemas ---
class InventoryBase(BaseModel):
    item_type: str
    required_quantity: int
    active: bool = True

class InventoryCreate(InventoryBase):
    centre_id: str
    room_id: Optional[str] = None

class InventoryResponse(InventoryBase):
    id: str
    centre_id: str
    room_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Reported Attendance Schemas ---
class ReportedAttendanceCreate(BaseModel):
    centre_id: str
    room_id: Optional[str] = None
    session_date: str # YYYY-MM-DD
    session_start: str # HH:MM
    session_end: str   # HH:MM
    reported_count: int
    source: str = "CENTRE_PORTAL"

class ReportedAttendanceResponse(ReportedAttendanceCreate):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- AI Observation Schemas ---
class AIAttendanceObservationCreate(BaseModel):
    centre_id: str
    camera_id: str
    room_id: Optional[str] = None
    session_date: str
    observed_count: int
    observation_confidence: float = 0.95
    dwell_threshold_seconds: int = 180
    observation_window_start: datetime
    observation_window_end: datetime
    evidence_uri: Optional[str] = None

class AIAttendanceObservationResponse(AIAttendanceObservationCreate):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InfrastructureObservationCreate(BaseModel):
    centre_id: str
    camera_id: str
    item_type: str
    required_quantity: int = 0
    observed_quantity: int
    confidence: float = 0.90
    state: str = "PRESENT"

class InfrastructureObservationResponse(InfrastructureObservationCreate):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Compliance Event / Alert Schemas ---
class ComplianceEventCreate(BaseModel):
    centre_id: str
    camera_id: Optional[str] = None
    room_id: Optional[str] = None
    event_type: str  # ATTENDANCE_MISMATCH, INFRASTRUCTURE_GAP, CAMERA_OFFLINE, CAMERA_OBSTRUCTED
    severity: str    # NORMAL, REVIEW, HIGH, CRITICAL
    confidence: float = 0.85
    status: str = "NEW"
    evidence_uri: Optional[str] = None
    payload_json: Optional[str] = None

class ComplianceEventReviewUpdate(BaseModel):
    status: str  # CONFIRMED, DISMISSED, UNDER_REVIEW, RESOLVED
    review_notes: Optional[str] = None
    reviewed_by: str

class ComplianceEventResponse(BaseModel):
    id: str
    centre_id: str
    camera_id: Optional[str]
    room_id: Optional[str]
    event_type: str
    severity: str
    confidence: float
    status: str
    evidence_uri: Optional[str]
    payload_json: Optional[str]
    review_notes: Optional[str]
    reviewed_by: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    metadata_json: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Analytics Overview ---
class AnalyticsOverview(BaseModel):
    total_centres: int
    active_centres: int
    total_alerts: int
    new_alerts: int
    high_critical_alerts: int
    online_cameras: int
    total_cameras: int
    average_attendance_compliance_pct: float
    recent_events: List[ComplianceEventResponse]
