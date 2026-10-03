import json
from datetime import datetime, timedelta
from backend.db.session import SessionLocal, engine, Base
from backend.models.db_models import (
    Centre, Room, Camera, SanctionedInventory, 
    ReportedAttendance, ComplianceEvent, AuditLog
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear old data if any for clean demo seeding
    db.query(AuditLog).delete()
    db.query(ComplianceEvent).delete()
    db.query(ReportedAttendance).delete()
    db.query(SanctionedInventory).delete()
    db.query(Camera).delete()
    db.query(Room).delete()
    db.query(Centre).delete()
    db.commit()

    print("Seeding Centres...")
    c1 = Centre(
        id="TC-101",
        name="Pune Advanced Skill & Vocational Hub",
        location="Shivajinagar, Pune",
        district="Pune",
        state="Maharashtra",
        sanctioned_capacity=30,
        status="ACTIVE"
    )
    c2 = Centre(
        id="TC-102",
        name="Delhi PMKK Skill Training Institute",
        location="Okhla Phase III",
        district="South East Delhi",
        state="Delhi",
        sanctioned_capacity=35,
        status="ACTIVE"
    )
    c3 = Centre(
        id="TC-103",
        name="Ranchi ITI Technical Academy",
        location="Hehal, Ranchi",
        district="Ranchi",
        state="Jharkhand",
        sanctioned_capacity=25,
        status="FLAG_REVIEW"
    )
    db.add_all([c1, c2, c3])
    db.commit()

    print("Seeding Rooms & Cameras...")
    r1 = Room(
        id="ROOM-101-A",
        centre_id="TC-101",
        name="Computer Lab 1",
        room_type="LAB",
        capacity=20,
        roi_polygon_json=json.dumps([[100, 100], [800, 100], [800, 600], [100, 600]])
    )
    r2 = Room(
        id="ROOM-101-B",
        centre_id="TC-101",
        name="Automotive Mechanics Workshop",
        room_type="WORKSHOP",
        capacity=15,
        roi_polygon_json=json.dumps([[50, 50], [900, 50], [900, 700], [50, 700]])
    )
    db.add_all([r1, r2])
    db.commit()

    cam1 = Camera(
        id="CAM-101-A1",
        centre_id="TC-101",
        room_id="ROOM-101-A",
        name="Lab-1 Front Angle",
        source_type="RTSP",
        stream_url="rtsp://demo:demo@192.168.1.101:554/stream1",
        status="ONLINE",
        last_seen_at=datetime.utcnow()
    )
    cam2 = Camera(
        id="CAM-101-B1",
        centre_id="TC-101",
        room_id="ROOM-101-B",
        name="Workshop Overhead",
        source_type="RTSP",
        stream_url="rtsp://demo:demo@192.168.1.102:554/stream1",
        status="ONLINE",
        last_seen_at=datetime.utcnow()
    )
    cam3 = Camera(
        id="CAM-102-A1",
        centre_id="TC-102",
        name="Classroom Main",
        source_type="RTSP",
        status="ONLINE",
        last_seen_at=datetime.utcnow()
    )
    cam4 = Camera(
        id="CAM-103-A1",
        centre_id="TC-103",
        name="Entrance / Hallway",
        source_type="RTSP",
        status="OFFLINE",
        last_seen_at=datetime.utcnow() - timedelta(minutes=15)
    )
    db.add_all([cam1, cam2, cam3, cam4])
    db.commit()

    print("Seeding Sanctioned Inventory...")
    inv1 = SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-A", item_type="computer", required_quantity=20)
    inv2 = SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-A", item_type="chair", required_quantity=25)
    inv3 = SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-B", item_type="workbench", required_quantity=8)
    inv4 = SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-B", item_type="sewing_machine", required_quantity=5)
    inv5 = SanctionedInventory(centre_id="TC-102", item_type="computer", required_quantity=30)
    db.add_all([inv1, inv2, inv3, inv4, inv5])
    db.commit()

    print("Seeding Reported Attendance...")
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    att1 = ReportedAttendance(
        centre_id="TC-101",
        room_id="ROOM-101-A",
        session_date=today_str,
        session_start="09:00",
        session_end="11:00",
        reported_count=20,
        source="CENTRE_PORTAL"
    )
    att2 = ReportedAttendance(
        centre_id="TC-102",
        session_date=today_str,
        session_start="10:00",
        session_end="12:00",
        reported_count=28,
        source="CENTRE_PORTAL"
    )
    db.add_all([att1, att2])
    db.commit()

    print("Seeding Baseline Compliance Events...")
    event1 = ComplianceEvent(
        centre_id="TC-101",
        camera_id="CAM-101-A1",
        room_id="ROOM-101-A",
        event_type="ATTENDANCE_MISMATCH",
        severity="HIGH",
        confidence=0.92,
        status="NEW",
        payload_json=json.dumps({
            "reported_count": 20,
            "observed_count": 12,
            "difference": 8,
            "relative_difference_pct": 40.0,
            "tolerance_threshold_pct": 15.0
        })
    )
    event2 = ComplianceEvent(
        centre_id="TC-101",
        camera_id="CAM-101-A1",
        room_id="ROOM-101-A",
        event_type="INFRASTRUCTURE_GAP",
        severity="REVIEW",
        confidence=0.88,
        status="UNDER_REVIEW",
        payload_json=json.dumps({
            "item_type": "computer",
            "sanctioned_quantity": 20,
            "observed_quantity": 17,
            "gap": 3
        })
    )
    event3 = ComplianceEvent(
        centre_id="TC-103",
        camera_id="CAM-103-A1",
        event_type="CAMERA_OFFLINE",
        severity="HIGH",
        confidence=1.0,
        status="NEW",
        payload_json=json.dumps({
            "offline_duration_minutes": 15,
            "last_heartbeat": (datetime.utcnow() - timedelta(minutes=15)).isoformat()
        })
    )
    db.add_all([event1, event2, event3])
    db.commit()

    print("Seeding Complete!")
    db.close()

if __name__ == "__main__":
    seed_database()
