from typing import List, Dict, Any
from collections import defaultdict, deque

class InfrastructureMonitor:
    """
    Implements Section 3 (Phase 9 & 10) of 01-ROADMAP.md:
    Monitors sanctioned infrastructure over a sliding temporal window
    to eliminate single-frame transient fluctuations.
    """
    def __init__(self, target_classes: List[str] = None, window_size: int = 15):
        self.target_classes = target_classes or ["computer", "chair", "workbench", "sewing_machine", "laptop"]
        self.window_size = window_size
        # class_name -> deque of counts per frame
        self.history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self.window_size))

    def update(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Updates counts from current frame detections.
        Returns aggregated observed counts and temporal stability confidence.
        """
        frame_counts = defaultdict(int)
        for det in detections:
            cls = det['class_name']
            if cls in self.target_classes or 'laptop' in cls:
                mapped_cls = 'computer' if cls == 'laptop' else cls
                frame_counts[mapped_cls] += 1

        for cls in self.target_classes:
            self.history[cls].append(frame_counts[cls])

        aggregated = {}
        for cls in self.target_classes:
            counts = list(self.history[cls])
            if not counts:
                aggregated[cls] = {'observed_count': 0, 'confidence': 0.0, 'state': 'NOT_OBSERVED'}
                continue

            # Median count over window
            counts_sorted = sorted(counts)
            median_count = counts_sorted[len(counts_sorted) // 2]
            
            # Temporal consistency = ratio of frames with this count
            consistency = sum(1 for c in counts if c == median_count) / float(len(counts))

            state = 'PRESENT' if median_count > 0 else 'NOT_OBSERVED'
            if consistency < 0.6:
                state = 'UNCERTAIN'

            aggregated[cls] = {
                'observed_count': median_count,
                'confidence': round(consistency, 2),
                'state': state
            }

        return aggregated
