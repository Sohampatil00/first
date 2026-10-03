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
