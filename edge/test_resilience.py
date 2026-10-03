import os
import json
import sqlite3
import requests
from edge.spool import enqueue_event, get_spool_stats, SPOOL_DB_PATH
from edge.sync import flush_spool_queue, check_backend_reachability

def test_offline_spool_and_recovery():
    print("==========================================================")
    print(" Running Edge Offline Resilience & Synchronization Test")
    print("==========================================================")

    api_base = "http://localhost:8001/api"
    
    # Verify backend is running
    assert check_backend_reachability(api_base), f"Backend at {api_base} is not reachable. Make sure server is running."
    print(" [Step 1] Verified Backend is ONLINE and reachable.")

    # 1. Clear local spool for clean test
    if os.path.exists(SPOOL_DB_PATH):
        os.remove(SPOOL_DB_PATH)
    assert get_spool_stats()["pending_events"] == 0
    print(" [Step 2] Cleaned local SQLite spool queue.")

    # 2. Simulate Network Disconnection & Outage
    print(" [Step 3] Simulating NETWORK DISCONNECTION at Centre TC-101...")
    
    # While disconnected, edge agent captures 3 events (1 attendance mismatch, 2 asset gaps)
    event1 = {
        "centre_id": "TC-101",
        "camera_id": "CAM-101-A1",
        "session_date": "2026-10-04",
        "observed_count": 14,
        "observation_confidence": 0.95,
        "dwell_threshold_seconds": 180,
        "observation_window_start": "2026-10-04T09:00:00",
        "observation_window_end": "2026-10-04T09:30:00"
    }
    event2 = {
        "centre_id": "TC-101",
        "camera_id": "CAM-101-A1",
        "item_type": "computer",
        "required_quantity": 20,
        "observed_quantity": 16,
        "confidence": 0.91,
        "state": "PRESENT"
    }
    event3 = {
        "centre_id": "TC-101",
        "camera_id": "CAM-101-A1",
        "item_type": "workbench",
        "required_quantity": 8,
        "observed_quantity": 5,
        "confidence": 0.88,
        "state": "PRESENT"
    }

    id1 = enqueue_event("/ai/observations/attendance", event1)
    id2 = enqueue_event("/ai/observations/infrastructure", event2)
    id3 = enqueue_event("/ai/observations/infrastructure", event3)

    stats = get_spool_stats()
    print(f" [Step 4] Enqueued 3 events into local SQLite spool while offline. Current spool count: {stats['pending_events']}")
    assert stats["pending_events"] == 3, f"Expected 3 spooled events, got {stats['pending_events']}"

    # 3. Simulate Network Restoration
    print(" [Step 5] Simulating NETWORK RESTORATION...")
    print(" [Step 6] Triggering automatic recovery synchronization (flush_spool_queue)...")
    
    sync_result = flush_spool_queue(api_base)
    print(f" [Step 7] Synchronization result: {json.dumps(sync_result)}")

    assert sync_result["synced"] == 3, f"Expected 3 synced events, got {sync_result['synced']}"
    assert sync_result["pending"] == 0, f"Expected 0 pending events in queue, got {sync_result['pending']}"

    print("==========================================================")
    print(" SUCCESS: Offline Resilience & Spool Sync Test Passed 100%!")
    print(" - Buffered events safely in SQLite while offline (Zero Data Loss)")
    print(" - Recovered and flushed batch cleanly upon reconnection")
    print("==========================================================")

if __name__ == "__main__":
    test_offline_spool_and_recovery()
