import numpy as np
from typing import List, Dict, Any, Tuple

def compute_iou(boxA, boxB) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
    return iou

class Track:
    def __init__(self, track_id: int, bbox: List[float], class_name: str, confidence: float):
        self.track_id = track_id
        self.bbox = bbox
        self.class_name = class_name
        self.confidence = confidence
        self.age = 1
        self.hits = 1
        self.time_since_update = 0
        self.history = [bbox]

    def update(self, bbox: List[float], confidence: float):
        self.bbox = bbox
        self.confidence = confidence
        self.hits += 1
        self.age += 1
        self.time_since_update = 0
        self.history.append(bbox)
        if len(self.history) > 30:
            self.history.pop(0)

    def mark_missed(self):
        self.age += 1
        self.time_since_update += 1

class MultiObjectTracker:
    """
    Lightweight, deterministic multi-object tracker for CCTV feeds.
    Enforces Phase 6 requirements: Track IDs are technical session keys, not identities.
    """
    def __init__(self, max_age: int = 15, iou_threshold: float = 0.3):
        self.max_age = max_age
        self.iou_threshold = iou_threshold
        self.tracks: List[Track] = []
        self.next_id = 1

    def update(self, detections: List[Dict[str, Any]]) -> List[Track]:
        """
        detections: list of dicts with keys: 'bbox' [x1, y1, x2, y2], 'class_name', 'confidence'
        returns list of currently active confirmed tracks
        """
        # If no tracks exist yet, initialize all detections
        if not self.tracks:
            for det in detections:
                self.tracks.append(Track(self.next_id, det['bbox'], det['class_name'], det['confidence']))
                self.next_id += 1
            return self.tracks

        # Compute IoU cost matrix
        num_tracks = len(self.tracks)
        num_dets = len(detections)

        if num_dets == 0:
            for track in self.tracks:
                track.mark_missed()
            self.tracks = [t for t in self.tracks if t.time_since_update <= self.max_age]
            return self.tracks

        iou_matrix = np.zeros((num_tracks, num_dets), dtype=np.float32)
        for t_idx, track in enumerate(self.tracks):
            for d_idx, det in enumerate(detections):
                if track.class_name == det['class_name']:
                    iou_matrix[t_idx, d_idx] = compute_iou(track.bbox, det['bbox'])
                else:
                    iou_matrix[t_idx, d_idx] = 0.0

        matched_tracks = set()
        matched_dets = set()

        # Greedy match highest IoU pairs
        while True:
            max_iou = np.max(iou_matrix)
            if max_iou < self.iou_threshold:
                break
            t_idx, d_idx = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
            
            self.tracks[t_idx].update(detections[d_idx]['bbox'], detections[d_idx]['confidence'])
            matched_tracks.add(t_idx)
            matched_dets.add(d_idx)
            
            iou_matrix[t_idx, :] = -1.0
            iou_matrix[:, d_idx] = -1.0

        # Mark unmatched tracks as missed
        for t_idx, track in enumerate(self.tracks):
            if t_idx not in matched_tracks:
                track.mark_missed()

        # Create new tracks for unmatched detections
        for d_idx, det in enumerate(detections):
            if d_idx not in matched_dets:
                self.tracks.append(Track(self.next_id, det['bbox'], det['class_name'], det['confidence']))
                self.next_id += 1

        # Remove dead tracks
        self.tracks = [t for t in self.tracks if t.time_since_update <= self.max_age]

        # Return confirmed tracks that have at least 2 hits
        return [t for t in self.tracks if t.hits >= 2]
