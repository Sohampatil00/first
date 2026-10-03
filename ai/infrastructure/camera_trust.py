import cv2
import numpy as np
from typing import Dict, Any, Tuple

def evaluate_camera_trust(frame: np.ndarray) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Implements Section 7.6 (Camera Trust Layer) of 01-ROADMAP.md:
    Checks if a camera frame is healthy enough to support attendance/asset claims.
    Detects:
    - Lens covered / black screen
    - Extreme glare / blown out frame
    - Severe obstruction or frozen blurry lens
    Returns: (is_healthy, status_code, metrics)
    """
    if frame is None or frame.size == 0:
        return False, "NO_SIGNAL", {"error": "Empty frame buffer"}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

    # 1. Blur / Edge density test (Laplacian variance)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # 2. Brightness distribution
    mean_brightness = float(np.mean(gray))

    # 3. Dynamic range / contrast
    contrast = float(np.std(gray))

    metrics = {
        "laplacian_variance": round(laplacian_var, 2),
        "mean_brightness": round(mean_brightness, 2),
        "contrast": round(contrast, 2)
    }

    # Evaluate thresholds
    if mean_brightness < 12.0:
        return False, "CAMERA_OCCLUDED_BLACK", {**metrics, "reason": "Lens completely covered or night mode offline"}
    
    if mean_brightness > 245.0:
        return False, "CAMERA_GLARE_BLOWN", {**metrics, "reason": "Severe direct light glare washing out scene"}

    if laplacian_var < 15.0 and contrast < 12.0:
        return False, "CAMERA_OBSTRUCTED_DEFOCUSED", {**metrics, "reason": "Lens blurred, occluded by sticker, or defocused"}

    return True, "HEALTHY", metrics
