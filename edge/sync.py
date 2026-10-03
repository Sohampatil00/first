import requests
import logging
from typing import Dict, Any
from edge.spool import get_pending_events, mark_event_synced, get_spool_stats

logger = logging.getLogger("edge_sync")

def check_backend_reachability(api_base_url: str, timeout: float = 2.0) -> bool:
    """Checks if the central monitoring API is reachable."""
    try:
        root_url = api_base_url.replace("/api", "")
        res = requests.get(f"{root_url}/", timeout=timeout)
        return res.status_code == 200
    except Exception:
        return False

def flush_spool_queue(api_base_url: str, batch_size: int = 50) -> Dict[str, Any]:
    """
    Flushes queued spool events chronologically to the central API.
    Returns sync metrics (synced count, failed count, remaining pending).
    """
    if not check_backend_reachability(api_base_url):
        return {
            "status": "UNREACHABLE",
            "synced": 0,
            "failed": 0,
            "pending": get_spool_stats()["pending_events"]
        }

    pending = get_pending_events(limit=batch_size)
    synced_count = 0
    failed_count = 0

    for item in pending:
        endpoint = item["endpoint"]
        url = f"{api_base_url}{endpoint}" if not endpoint.startswith("http") else endpoint
        try:
            res = requests.post(url, json=item["payload"], timeout=5)
            if res.status_code in [200, 201]:
                mark_event_synced(item["id"])
                synced_count += 1
            else:
                logger.warning(f"Failed to sync event {item['id']}: HTTP {res.status_code}")
                failed_count += 1
        except Exception as e:
            logger.error(f"Sync error for event {item['id']}: {e}")
            failed_count += 1
            break # Network dropped mid-sync

    stats = get_spool_stats()
    return {
        "status": "SYNCED" if stats["pending_events"] == 0 else "PARTIAL",
        "synced": synced_count,
        "failed": failed_count,
        "pending": stats["pending_events"]
    }
