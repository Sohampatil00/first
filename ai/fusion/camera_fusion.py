import numpy as np
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

@dataclass
class CameraObservation:
    camera_id: str
    timestamp: float
    bbox: List[float] # [x1, y1, x2, y2]
    confidence: float
    ground_point: Optional[Tuple[float, float]] = None # (norm_x, norm_y) in room coordinate space [0, 1]

@dataclass
class FusedTraineeTrack:
    global_id: str
    room_id: str
    norm_x: float
    norm_y: float
    fused_confidence: float
    contributing_cameras: List[str]
    last_updated: float
    observation_count: int = 1

class MultiCameraFusionEngine:
    """
    Multi-Camera Spatial Fusion Engine for PMKVY/MSDE Training Halls:
    Resolves multi-camera overlap, prevents double-counting, and provides
    calibrated 2D ground-plane occupancy maps.
    
    Features:
    - Homography / Perspective Ground Projection: Maps bounding box bottom-center (feet position)
      into room space [0, 1] x [0, 1].
    - Spatio-temporal greedy/Hungarian clustering within spatial radius threshold (e.g. ~1.2m).
    - Probabilistic confidence fusion: C_fused = 1 - prod(1 - C_i).
    - Generates 2D top-down occupancy heatmaps and fused headcount.
    """
    def __init__(
        self,
        room_id: str,
        spatial_distance_threshold: float = 0.09, # ~1.2m in normalized room coordinates
        temporal_window_sec: float = 1.5,
        min_cluster_confidence: float = 0.40
    ):
        self.room_id = room_id
        self.spatial_distance_threshold = spatial_distance_threshold
        self.temporal_window_sec = temporal_window_sec
        self.min_cluster_confidence = min_cluster_confidence

        # Per-camera perspective calibration matrices (default linear approximation)
        # In a real room, can be calibrated via 4 corner points
        self.camera_calibrations: Dict[str, np.ndarray] = {}
        self.active_tracks: Dict[str, FusedTraineeTrack] = {}
        self.next_global_id = 1001

    def register_camera_homography(self, camera_id: str, homography_matrix: np.ndarray):
        """Registers a 3x3 homography matrix mapping camera pixel coords [u, v, 1]^T -> room coords [x, y, 1]^T."""
        self.camera_calibrations[camera_id] = homography_matrix

    def project_to_room_plane(self, camera_id: str, bbox: List[float], img_width: int = 1280, img_height: int = 720) -> Tuple[float, float]:
        """
        Projects trainee feet position (bottom-center of bounding box) to room coordinate plane [0, 1] x [0, 1].
        If explicit homography is registered, applies H matrix. Otherwise, uses normalized linear perspective mapping.
        """
        x1, y1, x2, y2 = bbox
        feet_u = (x1 + x2) / 2.0
        feet_v = y2 # Trainee's ground contact point

        if camera_id in self.camera_calibrations:
            H = self.camera_calibrations[camera_id]
            pt = np.array([feet_u, feet_v, 1.0], dtype=np.float32)
            projected = H @ pt
            if projected[2] != 0:
                rx = float(projected[0] / projected[2])
                ry = float(projected[1] / projected[2])
                return (np.clip(rx, 0.0, 1.0), np.clip(ry, 0.0, 1.0))

        # Default normalized projection based on typical camera mounting angle
        norm_u = feet_u / max(1, img_width)
        norm_v = feet_v / max(1, img_height)

        # Distinguish standard camera perspectives (Front, Rear, Side)
        if "REAR" in camera_id or "A2" in camera_id:
            # Opposite perspective inverted on Y axis
            room_x = 1.0 - norm_u
            room_y = 1.0 - (norm_v * 0.8)
        else:
            room_x = norm_u
            room_y = norm_v * 0.85

        return (float(np.clip(room_x, 0.0, 1.0)), float(np.clip(room_y, 0.0, 1.0)))

    def fuse_camera_observations(
        self,
        observations_by_camera: Dict[str, List[Dict[str, Any]]],
        img_size: Tuple[int, int] = (1280, 720)
    ) -> Dict[str, Any]:
        """
        Main fusion entry point:
        Takes raw detections from multiple cameras in the same room recorded at timestamp T.
        Deduplicates overlapping views and calculates true physical headcount.
        
        Args:
            observations_by_camera: {
                "CAM-101-A1": [{"bbox": [x1, y1, x2, y2], "confidence": 0.92, "class_name": "person"}, ...],
                "CAM-101-A2": [{"bbox": [x1, y1, x2, y2], "confidence": 0.88, "class_name": "person"}, ...]
            }
        Returns:
            Dictionary with fused headcount, individual physical trainee positions, and coverage statistics.
        """
        now = time.time()
        projected_points: List[CameraObservation] = []

        raw_camera_counts = {}
        for cam_id, det_list in observations_by_camera.items():
            person_dets = [d for d in det_list if d.get('class_name', 'person') == 'person']
            raw_camera_counts[cam_id] = len(person_dets)
            for det in person_dets:
                bbox = det.get('bbox', [0, 0, 0, 0])
                conf = float(det.get('confidence', 0.85))
                gx, gy = self.project_to_room_plane(cam_id, bbox, img_size[0], img_size[1])
                projected_points.append(
                    CameraObservation(
                        camera_id=cam_id,
                        timestamp=now,
                        bbox=bbox,
                        confidence=conf,
                        ground_point=(gx, gy)
                    )
                )

        if not projected_points:
            return {
                "room_id": self.room_id,
                "fused_headcount": 0,
                "raw_camera_counts": raw_camera_counts,
                "trainee_clusters": [],
                "overlap_deduplicated_count": 0,
                "fusion_confidence_avg": 0.0
            }

        # Cluster points using spatial distance in room coordinate space
        clusters: List[List[CameraObservation]] = []
        assigned = [False] * len(projected_points)

        for i, pt_a in enumerate(projected_points):
            if assigned[i]:
                continue
            current_cluster = [pt_a]
            assigned[i] = True

            for j, pt_b in enumerate(projected_points):
                if assigned[j]:
                    continue
                # Same camera cannot detect the same physical person twice in the same cluster
                if pt_a.camera_id == pt_b.camera_id:
                    continue

                # Euclidean distance on ground plane
                dx = pt_a.ground_point[0] - pt_b.ground_point[0]
                dy = pt_a.ground_point[1] - pt_b.ground_point[1]
                dist = np.sqrt(dx * dx + dy * dy)

                if dist <= self.spatial_distance_threshold:
                    current_cluster.append(pt_b)
                    assigned[j] = True

            clusters.append(current_cluster)

        # Aggregate clusters into physical trainee entities
        trainee_entities = []
        total_raw_detections = len(projected_points)
        fused_confidences = []

        for idx, cluster in enumerate(clusters):
            # Compute centroid
            avg_x = float(np.mean([p.ground_point[0] for p in cluster]))
            avg_y = float(np.mean([p.ground_point[1] for p in cluster]))
            cams = list(set(p.camera_id for p in cluster))

            # Probabilistic confidence fusion: C_fused = 1 - prod(1 - c_i)
            miss_prob = 1.0
            for p in cluster:
                miss_prob *= (1.0 - min(0.99, p.confidence))
            fused_conf = float(round(1.0 - miss_prob, 3))
            fused_confidences.append(fused_conf)

            trainee_entities.append({
                "trainee_entity_id": f"PHYS-TR-{100 + idx}",
                "room_x": round(avg_x, 3),
                "room_y": round(avg_y, 3),
                "confidence": fused_conf,
                "observed_by_cameras": cams,
                "multi_angle_verified": len(cams) > 1
            })

        fused_headcount = len(trainee_entities)
        deduped = total_raw_detections - fused_headcount

        return {
            "room_id": self.room_id,
            "fused_headcount": fused_headcount,
            "raw_camera_counts": raw_camera_counts,
            "total_raw_detections": total_raw_detections,
            "overlap_deduplicated_count": max(0, deduped),
            "fusion_confidence_avg": round(float(np.mean(fused_confidences)), 3) if fused_confidences else 0.0,
            "multi_angle_verified_count": sum(1 for t in trainee_entities if t["multi_angle_verified"]),
            "trainees": trainee_entities
        }
