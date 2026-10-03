from typing import List, Dict, Any, Tuple
import math

def calculate_box_distance(boxA: List[float], boxB: List[float]) -> float:
    """Calculates Euclidean distance between centers of two bounding boxes."""
    cxA = (boxA[0] + boxA[2]) / 2.0
    cyA = (boxA[1] + boxA[3]) / 2.0
    cxB = (boxB[0] + boxB[2]) / 2.0
    cyB = (boxB[1] + boxB[3]) / 2.0
    return math.sqrt((cxA - cxB) ** 2 + (cyA - cyB) ** 2)

class AssetActivityReasoner:
    """
    Implements Phase 10 & 04-AI-PIPELINE.md (Apparent Operation Reasoning):
    Evaluates whether equipment exhibits visual cues of human interaction during practical sessions.
    States: ACTIVE_CUE, INACTIVE_CUE, PRESENT_ONLY, UNCERTAIN
    """
    def __init__(self, interaction_pixel_radius: float = 90.0):
        self.radius = interaction_pixel_radius
        # asset_id/index -> interaction frame count
        self.asset_interactions: Dict[int, int] = {}
        self.total_frames = 0

    def evaluate_frame(
        self, 
        person_boxes: List[List[float]], 
        asset_boxes: List[List[float]], 
        asset_type: str = "computer"
    ) -> List[Dict[str, Any]]:
        self.total_frames += 1
        results = []

        for idx, a_box in enumerate(asset_boxes):
            # Check if any person is within interaction radius
            has_interaction = False
            for p_box in person_boxes:
                dist = calculate_box_distance(p_box, a_box)
                if dist <= self.radius:
                    has_interaction = True
                    break

            if idx not in self.asset_interactions:
                self.asset_interactions[idx] = 0

            if has_interaction:
                self.asset_interactions[idx] += 1

            # Activity cue determination
            ratio = self.asset_interactions[idx] / float(max(self.total_frames, 1))

            if ratio >= 0.4:
                status = "ACTIVE_CUE"
            elif ratio <= 0.1 and self.total_frames >= 10:
                status = "INACTIVE_CUE"
            else:
                status = "PRESENT_ONLY"

            results.append({
                "asset_index": idx,
                "asset_type": asset_type,
                "bbox": a_box,
                "status": status,
                "activity_ratio": round(ratio, 2)
            })

        return results
