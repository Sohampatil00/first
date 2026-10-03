import os
import cv2
import numpy as np

def generate_demo_video(
    output_path: str = "datasets/demo_classroom_discrepancy.mp4",
    num_students: int = 12,
    num_computers: int = 17,
    duration_seconds: int = 6,
    fps: int = 10
):
    """
    Generates a realistic synthetic classroom scenario video for testing & deterministic demos.
    Scenario:
    - Sanctioned attendance: 20 -> Observed: 12 (Discrepancy: -8 students / 40% deficit)
    - Sanctioned computers: 20  -> Observed: 17 (Discrepancy: -3 computers)
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 960, 540
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    total_frames = duration_seconds * fps

    # Define desk layout (4 rows x 5 desks = 20 total desk spots)
    desks = []
    for r in range(4):
        for c in range(5):
            dx = 120 + c * 150
            dy = 160 + r * 80
            desks.append((dx, dy))

    for frame_idx in range(total_frames):
        # Create classroom background (soft neutral walls and tiled floor)
        frame = np.full((height, width, 3), (230, 235, 240), dtype=np.uint8)

        # Classroom floor
        cv2.rectangle(frame, (0, 140), (width, height), (200, 205, 215), -1)

        # Whiteboard on back wall
        cv2.rectangle(frame, (280, 20), (680, 110), (250, 250, 250), -1)
        cv2.rectangle(frame, (280, 20), (680, 110), (100, 100, 100), 2)
        cv2.putText(frame, "MSDE Advanced Skill Lab (TC-101)", (310, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (50, 50, 50), 2)

        # Draw desks, computers, and students
        for i, (dx, dy) in enumerate(desks):
            # Desk/Workbench
            cv2.rectangle(frame, (dx - 45, dy), (dx + 45, dy + 45), (140, 110, 80), -1)
            cv2.rectangle(frame, (dx - 45, dy), (dx + 45, dy + 45), (70, 50, 30), 1)

            # Draw computer monitor if i < num_computers
            if i < num_computers:
                # Monitor screen
                cv2.rectangle(frame, (dx - 22, dy - 26), (dx + 22, dy), (30, 30, 30), -1)
                cv2.rectangle(frame, (dx - 18, dy - 23), (dx + 18, dy - 3), (200, 220, 240), -1)
                # Stand
                cv2.rectangle(frame, (dx - 4, dy), (dx + 4, dy + 6), (50, 50, 50), -1)

            # Draw student if i < num_students
            if i < num_students:
                # Add subtle breathing/typing motion
                jitter = int(1.5 * np.sin((frame_idx + i * 5) * 0.2))
                sy = dy + jitter
                # Head
                cv2.circle(frame, (dx, sy - 42), 16, (170, 190, 220), -1)
                cv2.circle(frame, (dx, sy - 42), 16, (120, 140, 160), 1)
                # Torso / Shoulders
                cv2.ellipse(frame, (dx, sy - 15), (26, 20), 0, 0, 360, (50, 80, 160), -1)

        # Classroom ROI Boundary polygon overlay (semi-transparent green dashed)
        roi_pts = np.array([[80, 130], [880, 130], [920, 510], [40, 510]], np.int32)
        cv2.polylines(frame, [roi_pts], True, (0, 180, 100), 2, cv2.LINE_AA)
        cv2.putText(frame, "Classroom Monitoring ROI", (90, 155), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 140, 70), 2)

        # Video timestamp & camera ID watermark
        cv2.putText(frame, f"CAM-101-A1 | Frame: {frame_idx:03d} | Live Feed", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (40, 40, 40), 2)

        out.write(frame)

    out.release()
    print(f"Sample demo video generated: {output_path} ({duration_seconds}s, {total_frames} frames)")
    return output_path

if __name__ == "__main__":
    generate_demo_video()
