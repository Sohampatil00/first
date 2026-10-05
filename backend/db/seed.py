import os
import sys
import json
from pathlib import Path
from datetime import datetime, timedelta

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.db.session import SessionLocal, engine, Base
from backend.models.db_models import (
    Centre, Room, Camera, SanctionedInventory, 
    ReportedAttendance, ComplianceEvent, AuditLog, ReviewFeedback
)
from backend.db.generate_evidence_snapshots import create_evidence_images

def seed_database():
    """
    Seeds clean, institutional-grade structured data for the Ministry of Skill Development
    and Entrepreneurship (MSDE) - CentreWatch AI platform demonstration.
    """
    print("[1/6] Creating database schema tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[2/6] Purging old dummy data and resetting tables...")
    db.query(ReviewFeedback).delete()
    db.query(AuditLog).delete()
    db.query(ComplianceEvent).delete()
    db.query(ReportedAttendance).delete()
    db.query(SanctionedInventory).delete()
    db.query(Camera).delete()
    db.query(Room).delete()
    db.query(Centre).delete()
    db.commit()

    # Reset edge spool buffer if present
    spool_db = os.path.join("edge", "spool.db")
    if os.path.exists(spool_db):
        try:
            import sqlite3
            sconn = sqlite3.connect(spool_db)
            sconn.execute("DROP TABLE IF EXISTS spool_queue")
            sconn.commit()
            sconn.close()
        except Exception:
            pass

    # Generate synthetic CCTV evidence images if not already present
    create_evidence_images()

    print("[3/6] Seeding MSDE National Skill Centres across India...")
    centres = [
        Centre(
            id="TC-101",
            name="Pune Advanced Skill & Vocational Hub",
            location="Shivajinagar, Pune",
            district="Pune",
            state="Maharashtra",
            sanctioned_capacity=35,
            status="ACTIVE"
        ),
        Centre(
            id="TC-102",
            name="Delhi PMKK Skill Training Institute",
            location="Okhla Phase III",
            district="South East Delhi",
            state="Delhi",
            sanctioned_capacity=40,
            status="ACTIVE"
        ),
        Centre(
            id="TC-103",
            name="Ranchi ITI Technical Academy",
            location="Hehal, Ranchi",
            district="Ranchi",
            state="Jharkhand",
            sanctioned_capacity=25,
            status="FLAG_REVIEW"
        ),
        Centre(
            id="TC-104",
            name="Bengaluru Precision & Robotics Training Centre",
            location="Electronic City Phase 1",
            district="Bengaluru Urban",
            state="Karnataka",
            sanctioned_capacity=30,
            status="ACTIVE"
        ),
        Centre(
            id="TC-105",
            name="Bhopal Regional Vocational Training Institute",
            location="Govindpura Industrial Area",
            district="Bhopal",
            state="Madhya Pradesh",
            sanctioned_capacity=30,
            status="ACTIVE"
        ),
        Centre(
            id="TC-106",
            name="Jaipur Heritage & Handicrafts Skill Hub",
            location="Sitapura Industrial Area",
            district="Jaipur",
            state="Rajasthan",
            sanctioned_capacity=25,
            status="ACTIVE"
        )
    ]
    db.add_all(centres)
    db.commit()

    print("[4/6] Seeding Digital Twin Rooms & RTSP Cameras...")
    rooms = [
        # TC-101 Pune
        Room(
            id="ROOM-101-A",
            centre_id="TC-101",
            name="IT-ITeS Computer Lab 1",
            room_type="LAB",
            capacity=20,
            roi_polygon_json=json.dumps([[100, 100], [800, 100], [800, 600], [100, 600]])
        ),
        Room(
            id="ROOM-101-B",
            centre_id="TC-101",
            name="Automotive Mechanics Workshop",
            room_type="WORKSHOP",
            capacity=15,
            roi_polygon_json=json.dumps([[50, 50], [900, 50], [900, 700], [50, 700]])
        ),
        Room(
            id="ROOM-101-C",
            centre_id="TC-101",
            name="CNC & Design Simulation Classroom",
            room_type="CLASSROOM",
            capacity=25,
            roi_polygon_json=json.dumps([[80, 80], [850, 80], [850, 650], [80, 650]])
        ),
        # TC-102 Delhi
        Room(
            id="ROOM-102-A",
            centre_id="TC-102",
            name="Healthcare & GDA Simulation Lab",
            room_type="LAB",
            capacity=20,
            roi_polygon_json=json.dumps([[120, 100], [820, 100], [820, 580], [120, 580]])
        ),
        Room(
            id="ROOM-102-B",
            centre_id="TC-102",
            name="Emergency Care & Practical Ward",
            room_type="WORKSHOP",
            capacity=18,
            roi_polygon_json=json.dumps([[100, 60], [860, 60], [860, 620], [100, 620]])
        ),
        # TC-103 Ranchi
        Room(
            id="ROOM-103-A",
            centre_id="TC-103",
            name="Solar PV & Electrical Lab",
            room_type="LAB",
            capacity=15,
            roi_polygon_json=json.dumps([[90, 90], [810, 90], [810, 590], [90, 590]])
        ),
        Room(
            id="ROOM-103-B",
            centre_id="TC-103",
            name="Welding & Fabrication Bay",
            room_type="WORKSHOP",
            capacity=12,
            roi_polygon_json=json.dumps([[60, 60], [880, 60], [880, 680], [60, 680]])
        ),
        # TC-104 Bengaluru
        Room(
            id="ROOM-104-A",
            centre_id="TC-104",
            name="Robotics & Industrial Automation Bay",
            room_type="LAB",
            capacity=20,
            roi_polygon_json=json.dumps([[110, 100], [830, 100], [830, 600], [110, 600]])
        ),
        Room(
            id="ROOM-104-B",
            centre_id="TC-104",
            name="PCB Assembly & Soldering Workshop",
            room_type="WORKSHOP",
            capacity=15,
            roi_polygon_json=json.dumps([[70, 70], [850, 70], [850, 630], [70, 630]])
        ),
        # TC-105 Bhopal
        Room(
            id="ROOM-105-A",
            centre_id="TC-105",
            name="Apparel & Industrial Sewing Bay",
            room_type="WORKSHOP",
            capacity=25,
            roi_polygon_json=json.dumps([[80, 80], [870, 80], [870, 640], [80, 640]])
        ),
        Room(
            id="ROOM-105-B",
            centre_id="TC-105",
            name="Textile CAD & Pattern Design Lab",
            room_type="LAB",
            capacity=18,
            roi_polygon_json=json.dumps([[100, 100], [800, 100], [800, 600], [100, 600]])
        ),
        # TC-106 Jaipur
        Room(
            id="ROOM-106-A",
            centre_id="TC-106",
            name="CAD Jewelry Design Studio",
            room_type="LAB",
            capacity=18,
            roi_polygon_json=json.dumps([[100, 100], [820, 100], [820, 600], [100, 600]])
        ),
        Room(
            id="ROOM-106-B",
            centre_id="TC-106",
            name="Precision Gem Cutting Workshop",
            room_type="WORKSHOP",
            capacity=15,
            roi_polygon_json=json.dumps([[60, 60], [880, 60], [880, 650], [60, 650]])
        )
    ]
    db.add_all(rooms)
    db.commit()

    now = datetime.utcnow()
    cameras = [
        Camera(
            id="CAM-101-A1",
            centre_id="TC-101",
            room_id="ROOM-101-A",
            name="Lab-1 Front Angle",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.1.101:554/stream1",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-101-A2",
            centre_id="TC-101",
            room_id="ROOM-101-A",
            name="Lab-1 Rear Overlap",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.1.101:554/stream2",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-101-B1",
            centre_id="TC-101",
            room_id="ROOM-101-B",
            name="Workshop Overhead",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.1.102:554/stream1",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-102-A1",
            centre_id="TC-102",
            room_id="ROOM-102-A",
            name="Healthcare Sim Front",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.2.101:554/stream1",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-102-B1",
            centre_id="TC-102",
            room_id="ROOM-102-B",
            name="Emergency Bay Overhead",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.2.102:554/stream1",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-103-A1",
            centre_id="TC-103",
            room_id="ROOM-103-A",
            name="Solar Lab Main Feed",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.3.101:554/stream1",
            status="OFFLINE",
            last_seen_at=now - timedelta(minutes=45)
        ),
        Camera(
            id="CAM-103-B1",
            centre_id="TC-103",
            room_id="ROOM-103-B",
            name="Welding Bay West",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.3.102:554/stream1",
            status="OBSTRUCTED",
            last_seen_at=now
        ),
        Camera(
            id="CAM-104-A1",
            centre_id="TC-104",
            room_id="ROOM-104-A",
            name="Robotics Cell Primary",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.4.101:554/stream1",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-105-A1",
            centre_id="TC-105",
            room_id="ROOM-105-A",
            name="Sewing Bay Floor Line",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.5.101:554/stream1",
            status="ONLINE",
            last_seen_at=now
        ),
        Camera(
            id="CAM-106-A1",
            centre_id="TC-106",
            room_id="ROOM-106-A",
            name="CAD Studio Central",
            source_type="RTSP",
            stream_url="rtsp://demo:demo@192.168.6.101:554/stream1",
            status="ONLINE",
            last_seen_at=now
        )
    ]
    db.add_all(cameras)
    db.commit()

    print("[5/6] Seeding Sanctioned Inventories & Attendance Rosters...")
    inventory_items = [
        # TC-101 Pune
        SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-A", item_type="computer", required_quantity=20),
        SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-A", item_type="chair", required_quantity=25),
        SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-B", item_type="workbench", required_quantity=8),
        SanctionedInventory(centre_id="TC-101", room_id="ROOM-101-B", item_type="sewing_machine", required_quantity=5),
        # TC-102 Delhi
        SanctionedInventory(centre_id="TC-102", room_id="ROOM-102-A", item_type="computer", required_quantity=15),
        SanctionedInventory(centre_id="TC-102", room_id="ROOM-102-A", item_type="medical_bed", required_quantity=8),
        SanctionedInventory(centre_id="TC-102", room_id="ROOM-102-B", item_type="chair", required_quantity=24),
        # TC-103 Ranchi
        SanctionedInventory(centre_id="TC-103", room_id="ROOM-103-A", item_type="workbench", required_quantity=10),
        SanctionedInventory(centre_id="TC-103", room_id="ROOM-103-A", item_type="solar_bench", required_quantity=6),
        SanctionedInventory(centre_id="TC-103", room_id="ROOM-103-B", item_type="chair", required_quantity=15),
        # TC-104 Bengaluru
        SanctionedInventory(centre_id="TC-104", room_id="ROOM-104-A", item_type="computer", required_quantity=20),
        SanctionedInventory(centre_id="TC-104", room_id="ROOM-104-A", item_type="robotic_arm_trainer", required_quantity=8),
        SanctionedInventory(centre_id="TC-104", room_id="ROOM-104-B", item_type="workbench", required_quantity=10),
        # TC-105 Bhopal
        SanctionedInventory(centre_id="TC-105", room_id="ROOM-105-A", item_type="sewing_machine", required_quantity=20),
        SanctionedInventory(centre_id="TC-105", room_id="ROOM-105-A", item_type="chair", required_quantity=25),
        SanctionedInventory(centre_id="TC-105", room_id="ROOM-105-B", item_type="computer", required_quantity=18),
        # TC-106 Jaipur
        SanctionedInventory(centre_id="TC-106", room_id="ROOM-106-A", item_type="computer", required_quantity=18),
        SanctionedInventory(centre_id="TC-106", room_id="ROOM-106-A", item_type="chair", required_quantity=20),
        SanctionedInventory(centre_id="TC-106", room_id="ROOM-106-B", item_type="workbench", required_quantity=6),
    ]
    db.add_all(inventory_items)
    db.commit()

    today_str = now.strftime("%Y-%m-%d")
    attendances = [
        ReportedAttendance(
            centre_id="TC-101",
            room_id="ROOM-101-A",
            session_date=today_str,
            session_start="09:00",
            session_end="11:00",
            reported_count=20,
            source="CENTRE_PORTAL"
        ),
        ReportedAttendance(
            centre_id="TC-101",
            room_id="ROOM-101-B",
            session_date=today_str,
            session_start="11:30",
            session_end="13:30",
            reported_count=14,
            source="CENTRE_PORTAL"
        ),
        ReportedAttendance(
            centre_id="TC-102",
            room_id="ROOM-102-A",
            session_date=today_str,
            session_start="10:00",
            session_end="12:00",
            reported_count=20,
            source="CENTRE_PORTAL"
        ),
        ReportedAttendance(
            centre_id="TC-103",
            room_id="ROOM-103-A",
            session_date=today_str,
            session_start="09:30",
            session_end="11:30",
            reported_count=15,
            source="CENTRE_PORTAL"
        ),
        ReportedAttendance(
            centre_id="TC-104",
            room_id="ROOM-104-A",
            session_date=today_str,
            session_start="10:00",
            session_end="12:30",
            reported_count=19,
            source="CENTRE_PORTAL"
        ),
        ReportedAttendance(
            centre_id="TC-105",
            room_id="ROOM-105-A",
            session_date=today_str,
            session_start="09:00",
            session_end="12:00",
            reported_count=22,
            source="CENTRE_PORTAL"
        ),
        ReportedAttendance(
            centre_id="TC-106",
            room_id="ROOM-106-A",
            session_date=today_str,
            session_start="10:30",
            session_end="12:30",
            reported_count=17,
            source="CENTRE_PORTAL"
        ),
    ]
    db.add_all(attendances)
    db.commit()

    print("[6/6] Seeding High-Fidelity Compliance Events & Tamper-Evident Audit Ledger...")
    events = [
        # Event 1: Active Discrepancy at TC-101 Pune Computer Lab
        ComplianceEvent(
            centre_id="TC-101",
            camera_id="CAM-101-A1",
            room_id="ROOM-101-A",
            event_type="ATTENDANCE_MISMATCH",
            severity="HIGH",
            confidence=0.94,
            status="NEW",
            evidence_uri="/api/evidence/demo_attendance_evidence.jpg",
            payload_json=json.dumps({
                "reported": 20,
                "reported_count": 20,
                "observed": 12,
                "observed_count": 12,
                "difference": 8,
                "relative_difference_pct": 40.0,
                "tolerance_threshold_pct": 15.0,
                "dwell_threshold_seconds": 180,
                "batch_id": "BATCH-IT-01"
            }),
            created_at=now - timedelta(minutes=18)
        ),
        # Event 2: Infrastructure Gap at TC-101 Computer Lab
        ComplianceEvent(
            centre_id="TC-101",
            camera_id="CAM-101-A1",
            room_id="ROOM-101-A",
            event_type="INFRASTRUCTURE_GAP",
            severity="HIGH",
            confidence=0.91,
            status="UNDER_REVIEW",
            evidence_uri="/api/evidence/demo_inventory_evidence.jpg",
            payload_json=json.dumps({
                "item_type": "computer",
                "required": 20,
                "sanctioned_quantity": 20,
                "observed": 17,
                "observed_quantity": 17,
                "gap": 3,
                "difference": 3,
                "relative_difference_pct": 15.0
            }),
            created_at=now - timedelta(minutes=42)
        ),
        # Event 3: Camera Offline & SLA Escalation at TC-103 Ranchi
        ComplianceEvent(
            centre_id="TC-103",
            camera_id="CAM-103-A1",
            room_id="ROOM-103-A",
            event_type="CAMERA_OFFLINE",
            severity="CRITICAL",
            confidence=1.0,
            status="ESCALATED_TO_STATE",
            evidence_uri="/api/evidence/demo_camera_offline_evidence.jpg",
            review_notes="Auto-escalated to State Vigilance Directorate after exceeding 24h SLA response window.",
            reviewed_by="SYSTEM_ESCALATION_DAEMON",
            payload_json=json.dumps({
                "offline_duration_minutes": 45,
                "last_heartbeat": (now - timedelta(minutes=45)).isoformat(),
                "spool_buffered_events": 34,
                "network_status": "OFFLINE_SPOOLING"
            }),
            created_at=now - timedelta(hours=26)
        ),
        # Event 4: Optical Tamper at TC-103 Ranchi
        ComplianceEvent(
            centre_id="TC-103",
            camera_id="CAM-103-B1",
            room_id="ROOM-103-B",
            event_type="CAMERA_OBSTRUCTED",
            severity="HIGH",
            confidence=0.96,
            status="NEW",
            evidence_uri="/api/evidence/demo_camera_tamper_evidence.jpg",
            payload_json=json.dumps({
                "optical_variance": 7.4,
                "threshold": 35.0,
                "tamper_type": "LENS_OCCLUSION_OR_BLUR",
                "uncertainty_flag": True
            }),
            created_at=now - timedelta(minutes=55)
        ),
        # Event 5: Sewing Machine Gap at TC-105 Bhopal
        ComplianceEvent(
            centre_id="TC-105",
            camera_id="CAM-105-A1",
            room_id="ROOM-105-A",
            event_type="INFRASTRUCTURE_GAP",
            severity="HIGH",
            confidence=0.89,
            status="NEW",
            evidence_uri="/api/evidence/demo_sewing_evidence.jpg",
            payload_json=json.dumps({
                "item_type": "sewing_machine",
                "required": 20,
                "sanctioned_quantity": 20,
                "observed": 16,
                "observed_quantity": 16,
                "gap": 4,
                "difference": 4,
                "relative_difference_pct": 20.0
            }),
            created_at=now - timedelta(minutes=15)
        ),
        # Event 6: Adjudicated Healthcare Event at TC-102 Delhi
        ComplianceEvent(
            centre_id="TC-102",
            camera_id="CAM-102-A1",
            room_id="ROOM-102-A",
            event_type="ATTENDANCE_MISMATCH",
            severity="REVIEW",
            confidence=0.92,
            status="CONFIRMED",
            evidence_uri="/api/evidence/demo_healthcare_evidence.jpg",
            review_notes="Cross-checked with Delhi PMKK physical registry. 4 candidates dispatched to hospital ward for clinical rounds.",
            reviewed_by="OFFICER_VERMA",
            resolved_at=now - timedelta(hours=2),
            payload_json=json.dumps({
                "reported": 20,
                "reported_count": 20,
                "observed": 16,
                "observed_count": 16,
                "difference": 4,
                "relative_difference_pct": 20.0,
                "tolerance_threshold_pct": 15.0
            }),
            created_at=now - timedelta(hours=3)
        )
    ]
    db.add_all(events)
    db.commit()

    # Immutable Audit Logs
    audit_logs = [
        AuditLog(
            actor_id="SYSTEM_ALERT_ENGINE",
            action="CREATE_ALERT",
            entity_type="COMPLIANCE_EVENT",
            entity_id=events[0].id,
            metadata_json=json.dumps({"event_type": "ATTENDANCE_MISMATCH", "severity": "HIGH", "centre_id": "TC-101"}),
            created_at=now - timedelta(minutes=18)
        ),
        AuditLog(
            actor_id="SYSTEM_ALERT_ENGINE",
            action="CREATE_ALERT",
            entity_type="COMPLIANCE_EVENT",
            entity_id=events[1].id,
            metadata_json=json.dumps({"event_type": "INFRASTRUCTURE_GAP", "severity": "HIGH", "centre_id": "TC-101"}),
            created_at=now - timedelta(minutes=42)
        ),
        AuditLog(
            actor_id="SYSTEM_ESCALATION_DAEMON",
            action="AUTO_ESCALATE_TO_STATE",
            entity_type="COMPLIANCE_EVENT",
            entity_id=events[2].id,
            metadata_json=json.dumps({"reason": "SLA_BREACH_24H", "destination": "STATE_DIRECTORATE_JHARKHAND"}),
            created_at=now - timedelta(hours=2)
        ),
        AuditLog(
            actor_id="OFFICER_VERMA",
            action="REVIEW_ALERT_CONFIRMED",
            entity_type="COMPLIANCE_EVENT",
            entity_id=events[5].id,
            metadata_json=json.dumps({"decision": "CONFIRMED", "category": "EARLY_DISMISSAL", "notes": "Clinical rounds release verified."}),
            created_at=now - timedelta(hours=2)
        ),
        AuditLog(
            actor_id="OFFICER_PATIL",
            action="UPDATE_SANCTIONED_INVENTORY",
            entity_type="CENTRE",
            entity_id="TC-101",
            metadata_json=json.dumps({"action": "VERIFIED_ANNUAL_AUDIT", "centre": "Pune Advanced Skill Hub"}),
            created_at=now - timedelta(days=1)
        ),
        AuditLog(
            actor_id="OFFICER_DESHMUKH",
            action="CALIBRATE_ROOM_ROI",
            entity_type="ROOM",
            entity_id="ROOM-101-A",
            metadata_json=json.dumps({"polygon_points": 4, "room_type": "LAB"}),
            created_at=now - timedelta(days=2)
        )
    ]
    db.add_all(audit_logs)

    # Structured Feedback for Active Learning Model Recalibration
    feedback = [
        ReviewFeedback(
            event_id=events[5].id,
            centre_id="TC-102",
            decision="CONFIRMED",
            category="EARLY_DISMISSAL",
            notes="Clinical rounds release verified against institutional attendance ledger.",
            reviewed_by="OFFICER_VERMA",
            model_recalibration_flag="TUNE_DWELL",
            created_at=now - timedelta(hours=2)
        ),
        ReviewFeedback(
            event_id=events[1].id,
            centre_id="TC-101",
            decision="UNDER_REVIEW",
            category="EQUIPMENT_ABSENT",
            notes="3 workstations under maintenance in adjacent storage bay.",
            reviewed_by="OFFICER_PATIL",
            model_recalibration_flag="NONE",
            created_at=now - timedelta(minutes=30)
        )
    ]
    db.add_all(feedback)
    db.commit()

    print("[OK] CentreWatch AI Database Seed Completed Successfully!")
    print(f"     -> Centres: {len(centres)} across 6 States")
    print(f"     -> Rooms: {len(rooms)} with Calibrated ROIs")
    print(f"     -> Cameras: {len(cameras)} (Online, Offline, Obstructed)")
    print(f"     -> Sanctioned Inventory Mandates: {len(inventory_items)}")
    print(f"     -> Active Attendance Sessions: {len(attendances)}")
    print(f"     -> Compliance Events: {len(events)}")
    print(f"     -> Tamper-Evident Audit Records: {len(audit_logs)}")
    db.close()

if __name__ == "__main__":
    seed_database()
