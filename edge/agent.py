import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import time
import argparse
import logging
from datetime import datetime
from typing import Dict, Any

from ai.inference import EdgeInferencePipeline
from edge.spool import enqueue_event, get_spool_stats
from edge.sync import check_backend_reachability, flush_spool_queue

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("edge_agent")

class EdgeAgentDaemon:
    """
    Standalone Edge Agent Daemon implementing Phases 15 & 16:
    - Runs local inference at the training centre
    - Operates under constrained bandwidth
    - Buffers to SQLite spool when offline
    - Synchronizes batches upon network restoration
    """
    def __init__(
        self,
        centre_id: str = "TC-101",
        camera_id: str = "CAM-101-A1",
        room_id: str = "ROOM-101-A",
        api_base_url: str = "http://localhost:8001/api",
        simulate_offline: bool = False,
        vision_engine: str = "deim"
    ):
        self.centre_id = centre_id
        self.camera_id = camera_id
        self.room_id = room_id
        self.api_base_url = api_base_url
        self.simulate_offline = simulate_offline
        self.vision_engine = vision_engine

        self.pipeline = EdgeInferencePipeline(
            centre_id=centre_id,
            camera_id=camera_id,
            room_id=room_id,
            api_base_url=api_base_url,
            vision_engine=vision_engine
        )

    def send_heartbeat(self):
        """Dispatches camera health heartbeat to central backend."""
        if self.simulate_offline:
            logger.info("Heartbeat skipped: Agent is running in SIMULATED_OFFLINE mode.")
            return

        try:
            import requests
            url = f"{self.api_base_url}/cameras/{self.camera_id}/heartbeat"
            requests.post(url, json={"status": "ONLINE"}, timeout=3)
            logger.info(f"Heartbeat dispatched for {self.camera_id} -> ONLINE")
        except Exception as e:
            logger.warning(f"Could not send heartbeat for {self.camera_id}: {e}")

    def dispatch_observation(self, endpoint: str, payload: Dict[str, Any]):
        """
        Adaptive Dispatch:
        If online -> attempts direct post; if failed -> enqueues to SQLite.
        If offline mode -> directly enqueues to SQLite.
        """
        is_online = not self.simulate_offline and check_backend_reachability(self.api_base_url)

        if not is_online:
            rec_id = enqueue_event(endpoint, payload)
            stats = get_spool_stats()
            logger.info(f"[OFFLINE BUFFER] Enqueued {endpoint} to local spool (ID: {rec_id}). Total pending: {stats['pending_events']}")
            return

        # Attempt direct transmission
        try:
            import requests
            url = f"{self.api_base_url}{endpoint}"
            res = requests.post(url, json=payload, timeout=5)
            if res.status_code in [200, 201]:
                logger.info(f"[ONLINE TRANSMIT] Successfully dispatched {endpoint} (HTTP {res.status_code})")
            else:
                raise RuntimeError(f"HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Transmission failed ({e}). Falling back to local spool.")
            enqueue_event(endpoint, payload)

    def run_cycle(self, video_path: str):
        """Runs one inference cycle, updates health, and triggers spool sync if online."""
        logger.info(f"Running edge monitoring cycle on {video_path}...")
        self.send_heartbeat()

        # 1. Run local computer vision pipeline
        result = self.pipeline.process_video(video_path)

        # 2. Check if pending events exist in local spool and flush if online
        if not self.simulate_offline and check_backend_reachability(self.api_base_url):
            stats = get_spool_stats()
            if stats["pending_events"] > 0:
                logger.info(f"Network available! Flushing {stats['pending_events']} spooled events...")
                sync_result = flush_spool_queue(self.api_base_url)
                logger.info(f"Sync complete: {sync_result['synced']} events synced, {sync_result['pending']} remaining.")

        return result

def main():
    parser = argparse.ArgumentParser(description="CentreWatch AI - Edge Agent Daemon")
    parser.add_argument("--video", type=str, default="datasets/demo_classroom_discrepancy.mp4", help="Video source")
    parser.add_argument("--centre", type=str, default="TC-101", help="Centre ID")
    parser.add_argument("--camera", type=str, default="CAM-101-A1", help="Camera ID")
    parser.add_argument("--room", type=str, default="ROOM-101-A", help="Room ID")
    parser.add_argument("--api", type=str, default="http://localhost:8001/api", help="FastAPI Base URL")
    parser.add_argument("--offline", action="store_true", help="Simulate offline mode (buffer to SQLite)")
    parser.add_argument("--engine", type=str, default="deim", choices=["deim", "yolo"], help="Vision engine: deim (CVPR 2025 DETR) or yolo (YOLOv8)")
    args = parser.parse_args()

    agent = EdgeAgentDaemon(
        centre_id=args.centre,
        camera_id=args.camera,
        room_id=args.room,
        api_base_url=args.api,
        simulate_offline=args.offline,
        vision_engine=args.engine
    )

    agent.run_cycle(args.video)

if __name__ == "__main__":
    main()
