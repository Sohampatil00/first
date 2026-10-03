from typing import List, Tuple, Dict, Any

def point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    """Ray casting algorithm to check if (x, y) is inside polygon."""
    x, y = point
    n = len(polygon)
    inside = False
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

class AttendanceSessionTracker:
    """
    Implements Section 3 (Phase 7) of 01-ROADMAP.md:
    State Machine:
    NOT_SEEN -> DETECTED -> IN_ZONE -> DWELL_THRESHOLD_REACHED -> PRESENT -> LEFT_ZONE
    """
    def __init__(self, roi_polygon: List[List[float]], dwell_frames_threshold: int = 15):
        self.roi_polygon = roi_polygon
        self.dwell_frames_threshold = dwell_frames_threshold
        # track_id -> {'state': str, 'dwell_count': int, 'counted': bool}
        self.session_tracks: Dict[int, Dict[str, Any]] = {}
        self.unique_present_count = 0

    def process_tracks(self, tracks: List[Any]) -> Dict[str, Any]:
        """
        Processes tracks for current frame.
        Returns dict with current session metrics:
        'currently_in_zone': count,
        'cumulative_present': total verified present trainees
        """
        current_in_zone = 0

        for track in tracks:
            if track.class_name != 'person':
                continue

            # Trainee center point (bottom center of bbox for standing/sitting ground point)
            x1, y1, x2, y2 = track.bbox
            center_x = (x1 + x2) / 2.0
            ground_y = y2

            in_zone = True
            if self.roi_polygon and len(self.roi_polygon) >= 3:
                in_zone = point_in_polygon((center_x, ground_y), self.roi_polygon)

            if track.track_id not in self.session_tracks:
                self.session_tracks[track.track_id] = {
                    'state': 'DETECTED',
                    'dwell_count': 0,
                    'counted': False
                }

            record = self.session_tracks[track.track_id]

            if in_zone:
                current_in_zone += 1
                record['dwell_count'] += 1
                if record['dwell_count'] >= self.dwell_frames_threshold:
                    record['state'] = 'PRESENT'
                    if not record['counted']:
                        record['counted'] = True
                        self.unique_present_count += 1
                else:
                    record['state'] = 'IN_ZONE'
            else:
                if record['state'] == 'PRESENT':
                    record['state'] = 'LEFT_ZONE'

        return {
            'currently_in_zone': current_in_zone,
            'cumulative_present': self.unique_present_count,
            'total_tracks_seen': len(self.session_tracks)
        }
