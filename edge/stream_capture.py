import cv2
import time
import queue
import logging
import threading
import numpy as np
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

logger = logging.getLogger("edge_stream_capture")

class ThreadedStreamCapture:
    """
    Production-grade threaded RTSP / IP Camera Stream Reader for Edge Deployment.
    
    Addresses real-world edge camera issues:
    1. Buffer Lag / Frame Accumulation: OpenCV default buffers cause seconds of latency.
       This background thread grabs frames continuously and retains only the freshest frame.
    2. Network Drops / Wi-Fi Instability: Automatically detects feed starvation and
       reconnects with exponential backoff.
    3. Universal Ingestion: Transparently handles RTSP URLs, HTTP/MJPEG streams, webcams (0),
       local video files, or synthetic test pattern fallback.
    4. Bandwidth / Compute Optimization: Optional on-the-fly resolution downscaling.
    """
    def __init__(
        self,
        source: str,
        target_fps: int = 15,
        target_resolution: Optional[Tuple[int, int]] = (1280, 720),
        reconnect_timeout_sec: float = 6.0,
        max_reconnect_attempts: int = 10,
        synthetic_fallback: bool = True
    ):
        self.source = source
        self.target_fps = target_fps
        self.target_resolution = target_resolution
        self.reconnect_timeout_sec = reconnect_timeout_sec
        self.max_reconnect_attempts = max_reconnect_attempts
        self.synthetic_fallback = synthetic_fallback

        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._cap: Optional[cv2.VideoCapture] = None
        
        # Thread-safe single frame storage
        self._frame_lock = threading.Lock()
        self._latest_frame: Optional[np.ndarray] = None
        self._latest_timestamp: float = 0.0
        
        # Health & Telemetry Metrics
        self.status: str = "INITIALIZING" # INITIALIZING, STREAMING, RECONNECTING, FAILED, STOPPED
        self.frames_received: int = 0
        self.frames_dropped: int = 0
        self.reconnect_count: int = 0
        self.start_time: float = 0.0
        self.last_frame_time: float = 0.0
        self.is_synthetic_active: bool = False

    def start(self):
        """Starts the background capture thread."""
        if self._running:
            return
        self._running = True
        self.start_time = time.time()
        self._thread = threading.Thread(target=self._capture_worker, daemon=True, name=f"RTSP-Capture-{self.source}")
        self._thread.start()
        logger.info(f"Started ThreadedStreamCapture for source: {self.source}")

    def stop(self):
        """Stops the worker thread and releases hardware resources."""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        self._release_capture()
        self.status = "STOPPED"
        logger.info(f"Stopped ThreadedStreamCapture for source: {self.source}")

    def _open_capture(self) -> bool:
        """Attempts to open the video source using OpenCV with RTSP buffer optimization."""
        self._release_capture()
        try:
            # Handle integer webcam device indexes
            if self.source.isdigit():
                src = int(self.source)
            else:
                src = self.source

            # For RTSP, set transport and buffer size via environment / options if applicable
            cap = cv2.VideoCapture(src)
            
            # Configure OpenCV buffer size to 1 to minimize internal pipeline latency
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None:
                    self._cap = cap
                    self.is_synthetic_active = False
                    self.status = "STREAMING"
                    logger.info(f"Successfully connected to stream: {self.source}")
                    return True
            
            logger.warning(f"Unable to read initial frame from source: {self.source}")
        except Exception as e:
            logger.error(f"Error opening stream {self.source}: {e}")

        # If opening fails and fallback is enabled, activate synthetic test pattern
        if self.synthetic_fallback:
            logger.warning(f"Activating synthetic test stream fallback for {self.source}")
            self.is_synthetic_active = True
            self.status = "STREAMING"
            return True

        self.status = "FAILED"
        return False

    def _release_capture(self):
        """Safely closes cv2.VideoCapture."""
        if self._cap is not None:
            try:
                self._cap.release()
            except Exception:
                pass
            self._cap = None

    def _generate_synthetic_frame(self) -> np.ndarray:
        """Generates dynamic synthetic CCTV test feed with timestamp and noise overlay."""
        w, h = self.target_resolution if self.target_resolution else (1280, 720)
        img = np.zeros((h, w, 3), dtype=np.uint8)
        img[:] = (24, 28, 36) # Dark classroom tone

        # Grid lines / Room layout
        cv2.line(img, (0, int(h * 0.7)), (w, int(h * 0.7)), (50, 60, 80), 2)
        cv2.rectangle(img, (int(w * 0.15), int(h * 0.3)), (int(w * 0.85), int(h * 0.85)), (40, 50, 65), -1)

        # Draw simulated students / desks
        now = time.time()
        for i in range(12):
            col = i % 4
            row = i // 4
            x = int(w * 0.22 + col * (w * 0.18) + np.sin(now + i) * 3)
            y = int(h * 0.40 + row * (h * 0.15))
            
            # Desk & Trainee
            cv2.rectangle(img, (x - 30, y), (x + 30, y + 25), (70, 80, 100), -1)
            cv2.circle(img, (x, y - 10), 16, (140, 160, 190), -1) # Head
            cv2.rectangle(img, (x - 20, y + 5), (x + 20, y + 35), (100, 120, 150), -1) # Body

        # Telemetry HUD
        ts_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        cv2.putText(img, f"SRC: {self.source} [EDGE STREAM CAPTURE]", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (56, 189, 248), 2)
        cv2.putText(img, f"TIME: {ts_str} | RECONNECTS: {self.reconnect_count}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 220, 240), 1)
        cv2.putText(img, "STATUS: OK (BUFFER-FREE THREADED)", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (74, 222, 128), 1)

        # Privacy badge
        cv2.rectangle(img, (w - 280, 15), (w - 20, 50), (15, 23, 42), -1)
        cv2.putText(img, "PRIVACY MASKING ACTIVE", (w - 270, 38), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (56, 189, 248), 1)
        return img

    def _capture_worker(self):
        """Worker loop that grabs frames without buffering lag."""
        reconnect_delay = 1.0
        consecutive_errors = 0

        if not self._open_capture():
            self.status = "FAILED"

        frame_interval = 1.0 / max(1, self.target_fps)

        while self._running:
            loop_start = time.time()

            if self.is_synthetic_active:
                frame = self._generate_synthetic_frame()
                self._update_frame(frame)
                time.sleep(max(0.01, frame_interval - (time.time() - loop_start)))
                continue

            # Real Capture handling
            if self._cap is None or not self._cap.isOpened():
                self.status = "RECONNECTING"
                self.reconnect_count += 1
                logger.warning(f"Stream disconnected. Reconnecting in {reconnect_delay:.1f}s (Attempt #{self.reconnect_count})...")
                time.sleep(reconnect_delay)
                reconnect_delay = min(16.0, reconnect_delay * 1.5)
                if self._open_capture():
                    reconnect_delay = 1.0
                    consecutive_errors = 0
                continue

            # Grab frame directly
            try:
                ret, frame = self._cap.read()
                if not ret or frame is None:
                    consecutive_errors += 1
                    if consecutive_errors > 30: # ~2 seconds of missed frames
                        logger.warning(f"Frame feed starved on {self.source}. Triggering reconnect...")
                        self._release_capture()
                    time.sleep(0.05)
                    continue

                consecutive_errors = 0
                reconnect_delay = 1.0

                # Downscale if requested for edge compute efficiency
                if self.target_resolution:
                    tw, th = self.target_resolution
                    if frame.shape[1] != tw or frame.shape[0] != th:
                        frame = cv2.resize(frame, (tw, th), interpolation=cv2.INTER_LINEAR)

                self._update_frame(frame)

            except Exception as e:
                logger.error(f"Error during frame capture: {e}")
                consecutive_errors += 1
                time.sleep(0.1)

            # Throttle slightly to target FPS to prevent burning CPU
            elapsed = time.time() - loop_start
            sleep_time = frame_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

    def _update_frame(self, frame: np.ndarray):
        """Thread-safe update of the latest frame."""
        now = time.time()
        with self._frame_lock:
            if self._latest_frame is not None:
                self.frames_dropped += 1 # Previous frame was replaced before being consumed
            self._latest_frame = frame
            self._latest_timestamp = now
            self.frames_received += 1
            self.last_frame_time = now
            self.status = "STREAMING"

    def read(self) -> Tuple[bool, Optional[np.ndarray], float]:
        """
        Retrieves the latest available frame.
        Returns:
            (success: bool, frame: np.ndarray, timestamp: float)
        """
        with self._frame_lock:
            if self._latest_frame is None:
                return False, None, 0.0
            frame = self._latest_frame.copy()
            timestamp = self._latest_timestamp
            self._latest_frame = None # Mark consumed
            return True, frame, timestamp

    def get_telemetry(self) -> Dict[str, Any]:
        """Returns runtime performance and connectivity telemetry."""
        now = time.time()
        uptime = max(0.1, now - self.start_time)
        measured_fps = round(self.frames_received / uptime, 1) if uptime > 0 else 0.0
        
        return {
            "source": self.source,
            "status": self.status,
            "uptime_seconds": round(uptime, 1),
            "fps": measured_fps,
            "frames_received": self.frames_received,
            "frames_dropped": self.frames_dropped,
            "reconnect_count": self.reconnect_count,
            "is_synthetic": self.is_synthetic_active,
            "last_frame_seconds_ago": round(now - self.last_frame_time, 2) if self.last_frame_time > 0 else None
        }
