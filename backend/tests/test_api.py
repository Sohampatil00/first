import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_centres():
    response = client.get("/api/centres")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    centre_ids = [c["id"] for c in data]
    assert "TC-101" in centre_ids

def test_centre_detail():
    response = client.get("/api/centres/TC-101")
    assert response.status_code == 200
    data = response.json()
    assert data["centre"]["id"] == "TC-101"
    assert len(data["rooms"]) >= 2
    assert len(data["inventory"]) >= 4

def test_list_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1

def test_review_alert():
    # Fetch an alert
    alerts = client.get("/api/alerts").json()
    first_alert = alerts[0]
    alert_id = first_alert["id"]

    # Review it
    update_payload = {
        "status": "CONFIRMED",
        "review_notes": "Verified against physical session sheet. Discrepancy confirmed.",
        "reviewed_by": "OFFICER_SOHAM"
    }
    response = client.patch(f"/api/alerts/{alert_id}/review", json=update_payload)
    assert response.status_code == 200
    updated = response.json()
    assert updated["status"] == "CONFIRMED"
    assert updated["reviewed_by"] == "OFFICER_SOHAM"

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_centres"] >= 3
    assert data["total_alerts"] >= 1

def test_get_and_update_settings():
    # Test GET settings
    res = client.get("/api/settings")
    assert res.status_code == 200
    assert "attendance_tolerance_pct" in res.json()

    # Test POST settings
    update_data = {
        "attendance_tolerance_pct": 18.0,
        "dwell_time_seconds": 200,
        "asset_gap_threshold": 2,
        "privacy_blur_mode": "GAUSSIAN_FACE_MASK",
        "evidence_retention_days": 120,
        "auto_escalate_critical_hours": 36,
        "modified_by": "MINISTRY_OFFICER"
    }
    update_res = client.post("/api/settings", json=update_data)
    assert update_res.status_code == 200
    assert update_res.json()["settings"]["attendance_tolerance_pct"] == 18.0

def test_demo_scenario_trigger():
    res = client.post("/api/demo/trigger-scenario?scenario=ATTENDANCE_DISCREPANCY")
    assert res.status_code == 200
    assert res.json()["status"] == "SUCCESS"
    assert res.json()["type"] == "ATTENDANCE_MISMATCH"

def test_alert_auto_escalation():
    # Trigger an escalation check with force_hours=0 so newly created critical alert escalates immediately
    res = client.post("/api/alerts/escalate-pending?force_hours=0")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "escalated_count" in data

def test_review_feedback_and_export():
    # 1. Fetch an alert
    alerts = client.get("/api/alerts").json()
    assert len(alerts) > 0
    target_alert = alerts[0]

    # 2. Review with structured category
    review_res = client.patch(f"/api/alerts/{target_alert['id']}/review", json={
        "status": "CONFIRMED",
        "category": "GHOST_TRAINEES",
        "review_notes": "Ground-truth audit confirms 13 students absent from roster",
        "reviewed_by": "VIGILANCE_OFFICER_PATIL"
    })
    assert review_res.status_code == 200

    # 3. Check feedback list endpoint
    fb_res = client.get("/api/alerts/feedback/list")
    assert fb_res.status_code == 200
    feedbacks = fb_res.json()
    assert len(feedbacks) > 0
    assert any(f["category"] == "GHOST_TRAINEES" for f in feedbacks)

    # 4. Check feedback CSV export endpoint
    csv_res = client.get("/api/alerts/feedback/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "GHOST_TRAINEES" in csv_res.text


