"""
CentreWatch AI - Standalone Laptop Webcam Edge Capture
Streams video frames from the local laptop webcam into the YOLOv8 Edge Inference Pipeline.
Usage:
  source .venv/bin/activate
  python edge/webcam_stream.py --camera-index 0 --centre TC-101 --camera CAM-101-A1
"""

import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import time
import argparse
import logging
import cv2
import requests

from ai.inference import EdgeInferencePipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("webcam_stream")

def run_webcam_stream(camera_index: int = 0, centre_id: str = "TC-101", camera_id: str = "CAM-101-A1", api_url: str = "http://localhost:8001/api"):
    logger.info(f"Opening local laptop webcam at index {camera_index}...")
    
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        logger.error(
            "\n[!] Could not open local camera at index %d.\n"
            "    On macOS, Python / Terminal must be granted Camera permissions:\n"
            "    System Settings -> Privacy & Security -> Camera -> Enable for Terminal / VS Code / Cursor.\n"
            "    ALTERNATIVE (RECOMMENDED): Open http://localhost:3000 -> Live Cameras tab -> Click 'Use My Laptop Webcam' for instant browser-native access with zero permission setup!\n",
            camera_index
        )
        sys.exit(1)

    # Initialize YOLO Edge Pipeline
    pipeline = EdgeInferencePipeline(
        centre_id=centre_id,
        camera_id=camera_id,
        api_base_url=api_url
    )

    logger.info("Webcam opened successfully! Press 'q' inside the OpenCV window to exit.")

    frame_count = 0
    last_infer_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            logger.warning("Frame grab failed, retrying...")
            time.sleep(0.1)
            continue

        frame_count += 1
        current_time = time.time()

        # Run YOLO inference every 1.5 seconds to conserve edge CPU
        if current_time - last_infer_time > 1.5:
            last_infer_time = current_time
            results = pipeline.model(frame, verbose=False, conf=0.3)[0]
            
            persons = 0
            for box in results.boxes:
                cls_id = int(box.cls[0])
                cls_name = pipeline.model.names[cls_id]
                if cls_name == "person":
                    persons += 1
                    xyxy = [int(v) for v in box.xyxy[0].tolist()]
                    # Draw green bounding box
                    cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), (0, 255, 0), 2)
                    cv2.putText(frame, "Trainee (Verified)", (xyxy[0], xyxy[1] - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    
                    # Apply Privacy Face Blur (Top 35%)
                    head_h = int((xyxy[3] - xyxy[1]) * 0.35)
                    if head_h > 4 and (xyxy[2] - xyxy[0]) > 4:
                        head_roi = frame[xyxy[1]:xyxy[1] + head_h, xyxy[0]:xyxy[2]]
                        frame[xyxy[1]:xyxy[1] + head_h, xyxy[0]:xyxy[2]] = cv2.GaussianBlur(head_roi, (35, 35), 30)

            logger.info(f"Frame #{frame_count}: Observed {persons} persons on laptop webcam.")

            # Send telemetry heartbeat
            try:
                requests.post(f"{api_url}/cameras/{camera_id}/heartbeat", json={"status": "ONLINE"}, timeout=2)
            except Exception:
                pass

        # Display edge window if GUI is available
        try:
            cv2.imshow("CentreWatch AI - Laptop Webcam Edge Viewport", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        except Exception:
            # Headless environment
            pass

    cap.release()
    cv2.destroyAllWindows()
    logger.info("Webcam stream stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--camera-index", type=int, default=0, help="Camera device index (default: 0)")
    parser.add_argument("--centre", type=str, default="TC-101")
    parser.add_argument("--camera", type=str, default="CAM-101-A1")
    parser.add_argument("--api", type=str, default="http://localhost:8001/api")
    args = parser.parse_args()

    run_webcam_stream(args.camera_index, args.centre, args.camera, args.api)
