import os
import base64
from datetime import datetime
from typing import Optional

EVIDENCE_DIR = os.getenv("EVIDENCE_DIR", "./evidence_storage")
os.makedirs(EVIDENCE_DIR, exist_ok=True)

def save_evidence_snapshot(
    image_bytes: bytes, 
    centre_id: str, 
    event_type: str
) -> str:
    """
    Saves an evidence snapshot locally and returns its relative URI.
    """
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{centre_id}_{event_type}_{timestamp}.jpg"
    filepath = os.path.join(EVIDENCE_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(image_bytes)

    return f"/api/evidence/{filename}"

def save_base64_evidence(
    b64_data: str,
    centre_id: str,
    event_type: str
) -> str:
    """Decodes base64 frame and stores as evidence snapshot."""
    if "," in b64_data:
        b64_data = b64_data.split(",")[1]
    raw_bytes = base64.b64decode(b64_data)
    return save_evidence_snapshot(raw_bytes, centre_id, event_type)
