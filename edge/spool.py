import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

SPOOL_DB_PATH = os.getenv("SPOOL_DB_PATH", "edge/spool.db")

def init_spool_db(db_path: str = SPOOL_DB_PATH):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spool_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'PENDING',
            retry_count INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

def enqueue_event(endpoint: str, payload: Dict[str, Any], db_path: str = SPOOL_DB_PATH) -> int:
    """Enqueues an unsent observation or alert payload into local SQLite buffer."""
    init_spool_db(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO spool_queue (endpoint, payload_json, status)
        VALUES (?, ?, 'PENDING')
    """, (endpoint, json.dumps(payload, default=str)))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_pending_events(limit: int = 50, db_path: str = SPOOL_DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves pending buffered events ordered chronologically."""
    init_spool_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, endpoint, payload_json, created_at, retry_count
        FROM spool_queue
        WHERE status = 'PENDING'
        ORDER BY id ASC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "endpoint": r["endpoint"],
            "payload": json.loads(r["payload_json"]),
            "created_at": r["created_at"],
            "retry_count": r["retry_count"]
        })
    conn.close()
    return results

def mark_event_synced(record_id: int, db_path: str = SPOOL_DB_PATH):
    """Marks a buffered event as successfully synced and deletes it or updates status."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM spool_queue WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

def get_spool_stats(db_path: str = SPOOL_DB_PATH) -> Dict[str, int]:
    """Returns number of pending events waiting in local edge spool."""
    init_spool_db(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM spool_queue WHERE status = 'PENDING'")
    pending = cursor.fetchone()[0]
    conn.close()
    return {"pending_events": pending}
