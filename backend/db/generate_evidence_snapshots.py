import os
import cv2
import numpy as np

def create_evidence_images():
    output_dir = "evidence_storage"
    os.makedirs(output_dir, exist_ok=True)
    w, h = 960, 540

    # -------------------------------------------------------------
    # 1. demo_attendance_evidence.jpg (Attendance Mismatch in Computer Lab)
    # -------------------------------------------------------------
    img1 = np.full((h, w, 3), (235, 238, 242), dtype=np.uint8)
    # Floor
    cv2.rectangle(img1, (0, 150), (w, h), (200, 205, 215), -1)
    # Whiteboard
    cv2.rectangle(img1, (260, 25), (700, 115), (252, 252, 252), -1)
    cv2.rectangle(img1, (260, 25), (700, 115), (100, 110, 120), 2)
    cv2.putText(img1, "MSDE Advanced Skill Lab (TC-101 Pune) - Batch IT-01", (280, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (40, 50, 60), 2)

    # Classroom ROI polygon
    roi_pts = np.array([[60, 140], [900, 140], [930, 500], [30, 500]], np.int32)
    cv2.polylines(img1, [roi_pts], True, (0, 200, 115), 2, cv2.LINE_AA)
    cv2.putText(img1, "ROI: CLASSROOM-ACTIVE-ZONE", (70, 165), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 160, 80), 1)

    # 4 rows x 5 desks = 20 desk positions
    desks = []
    for r in range(4):
        for c in range(5):
            dx = 120 + c * 150
            dy = 180 + r * 75
            desks.append((dx, dy))

    # Draw desks, computers, students (12 present out of 20)
    for i, (dx, dy) in enumerate(desks):
        # Desk
        cv2.rectangle(img1, (dx - 45, dy), (dx + 45, dy + 40), (145, 115, 85), -1)
        cv2.rectangle(img1, (dx - 45, dy), (dx + 45, dy + 40), (80, 60, 40), 1)
        # Monitor
        cv2.rectangle(img1, (dx - 20, dy - 24), (dx + 20, dy), (35, 35, 35), -1)
        cv2.rectangle(img1, (dx - 16, dy - 21), (dx + 16, dy - 3), (210, 230, 250), -1)
        cv2.rectangle(img1, (dx - 4, dy), (dx + 4, dy + 5), (60, 60, 60), -1)

        # 12 students present
        if i < 12:
            # Torso
            cv2.ellipse(img1, (dx, dy - 12), (24, 18), 0, 0, 360, (55, 85, 165), -1)
            # Head with Gaussian Face Blur
            head_x, head_y, rad = dx, dy - 38, 17
            # Draw synthetic face
            cv2.circle(img1, (head_x, head_y), rad, (180, 200, 225), -1)
            # Blur head region to simulate DPDP Act 2023 Gaussian privacy mask
            sub_face = img1[max(0, head_y - rad):min(h, head_y + rad), max(0, head_x - rad):min(w, head_x + rad)]
            if sub_face.shape[0] > 0 and sub_face.shape[1] > 0:
                blurred = cv2.GaussianBlur(sub_face, (25, 25), 30)
                img1[max(0, head_y - rad):min(h, head_y + rad), max(0, head_x - rad):min(w, head_x + rad)] = blurred
            # Privacy mask border
            cv2.circle(img1, (head_x, head_y), rad, (0, 220, 130), 1)

            # Person detection bounding box
            bx1, by1 = dx - 30, dy - 58
            bx2, by2 = dx + 30, dy + 35
            cv2.rectangle(img1, (bx1, by1), (bx2, by2), (34, 197, 94), 2)
            cv2.putText(img1, f"person: {0.92 + (i % 5)*0.01:.2f}", (bx1, by1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (34, 197, 94), 1)
        else:
            # Ghost / Missing Trainee slot
            cv2.rectangle(img1, (dx - 32, dy - 50), (dx + 32, dy + 35), (0, 0, 230), 1)
            cv2.putText(img1, "ABSENT", (dx - 22, dy + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 230), 1)

    # Discrepancy Alert HUD Banner
    cv2.rectangle(img1, (0, 0), (w, 40), (15, 23, 42), -1)
    cv2.putText(img1, "CENTREWATCH AI | CCTV EVIDENCE AUDIT SNAPSHOT", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(img1, "CAM-101-A1 | PUNE HUB | 2026-10-05 10:30:00 UTC", (w - 370, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (56, 189, 248), 1)

    # Bottom Alert Flag Box
    cv2.rectangle(img1, (w // 2 - 270, h - 55), (w // 2 + 270, h - 10), (220, 38, 38), -1)
    cv2.rectangle(img1, (w // 2 - 270, h - 55), (w // 2 + 270, h - 10), (255, 255, 255), 2)
    cv2.putText(img1, "ATTENDANCE DEFICIT ALERT: 40% (REPORTED: 20 | OBSERVED: 12)", (w // 2 - 250, h - 33), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 2)
    cv2.putText(img1, "Dwell Threshold >= 180s Verified | Face Blurred per DPDP Act 2023", (w // 2 - 230, h - 17), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 230, 230), 1)

    cv2.imwrite(os.path.join(output_dir, "demo_attendance_evidence.jpg"), img1)

    # -------------------------------------------------------------
    # 2. demo_inventory_evidence.jpg (Missing Computers in Computer Lab)
    # -------------------------------------------------------------
    img2 = np.full((h, w, 3), (235, 238, 242), dtype=np.uint8)
    cv2.rectangle(img2, (0, 150), (w, h), (200, 205, 215), -1)
    cv2.rectangle(img2, (260, 25), (700, 115), (252, 252, 252), -1)
    cv2.rectangle(img2, (260, 25), (700, 115), (100, 110, 120), 2)
    cv2.putText(img2, "MSDE Physical Asset Audit (TC-101 Pune) - Mandate: 20 Computers", (270, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (40, 50, 60), 2)

    for i, (dx, dy) in enumerate(desks):
        cv2.rectangle(img2, (dx - 45, dy), (dx + 45, dy + 40), (145, 115, 85), -1)
        cv2.rectangle(img2, (dx - 45, dy), (dx + 45, dy + 40), (80, 60, 40), 1)

        # 17 computers present, 3 missing
        if i < 17:
            cv2.rectangle(img2, (dx - 20, dy - 24), (dx + 20, dy), (35, 35, 35), -1)
            cv2.rectangle(img2, (dx - 16, dy - 21), (dx + 16, dy - 3), (210, 230, 250), -1)
            cv2.rectangle(img2, (dx - 4, dy), (dx + 4, dy + 5), (60, 60, 60), -1)
            cv2.rectangle(img2, (dx - 25, dy - 30), (dx + 25, dy + 10), (34, 197, 94), 2)
            cv2.putText(img2, "computer: 0.96", (dx - 28, dy - 34), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (34, 197, 94), 1)
        else:
            # Highlight missing computer gap
            cv2.rectangle(img2, (dx - 30, dy - 35), (dx + 30, dy + 15), (0, 0, 230), 2)
            cv2.putText(img2, "MISSING ASSET", (dx - 35, dy - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 230), 1)

    cv2.rectangle(img2, (0, 0), (w, 40), (15, 23, 42), -1)
    cv2.putText(img2, "CENTREWATCH AI | SANCTIONED INVENTORY RECONCILIATION", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(img2, "CAM-101-A1 | PUNE HUB | ROOM-101-A", (w - 320, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (56, 189, 248), 1)

    cv2.rectangle(img2, (w // 2 - 250, h - 55), (w // 2 + 250, h - 10), (217, 119, 6), -1)
    cv2.rectangle(img2, (w // 2 - 250, h - 55), (w // 2 + 250, h - 10), (255, 255, 255), 2)
    cv2.putText(img2, "EQUIPMENT GAP: SANCTIONED 20 | DETECTED 17 | GAP: -3", (w // 2 - 230, h - 33), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 2)
    cv2.putText(img2, "Item: Computer / Workstation | Confidence: 91% | Status: Under Review", (w // 2 - 215, h - 17), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 245, 230), 1)

    cv2.imwrite(os.path.join(output_dir, "demo_inventory_evidence.jpg"), img2)

    # -------------------------------------------------------------
    # 3. demo_camera_tamper_evidence.jpg (Obstructed / Occluded Lens)
    # -------------------------------------------------------------
    img3 = np.full((h, w, 3), (40, 45, 50), dtype=np.uint8)
    # Add heavy blur/smudge circles simulating spray paint or occlusion cloth
    cv2.circle(img3, (w // 2, h // 2), 220, (30, 32, 35), -1)
    cv2.circle(img3, (w // 2 - 60, h // 2 + 40), 180, (20, 22, 25), -1)
    img3 = cv2.GaussianBlur(img3, (99, 99), 40)

    cv2.rectangle(img3, (0, 0), (w, 40), (15, 23, 42), -1)
    cv2.putText(img3, "CAMERA TRUST ENGINE | OPTICAL TAMPER DETECTION", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(img3, "CAM-103-B1 | RANCHI ITI WELDING BAY", (w - 340, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (239, 68, 68), 1)

    cv2.rectangle(img3, (w // 2 - 260, h // 2 - 60), (w // 2 + 260, h // 2 + 60), (185, 28, 28), -1)
    cv2.rectangle(img3, (w // 2 - 260, h // 2 - 60), (w // 2 + 260, h // 2 + 60), (255, 255, 255), 2)
    cv2.putText(img3, "STATUS: CAMERA_OBSTRUCTED", (w // 2 - 160, h // 2 - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
    cv2.putText(img3, "Optical Laplacian Variance: 7.4 (Trust Threshold < 35.0)", (w // 2 - 210, h // 2 + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (255, 220, 220), 1)
    cv2.putText(img3, "Auto-classified as Sensor Fault - Centre Protected from False Accusation", (w // 2 - 240, h // 2 + 35), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 240, 240), 1)

    cv2.imwrite(os.path.join(output_dir, "demo_camera_tamper_evidence.jpg"), img3)

    # -------------------------------------------------------------
    # 4. demo_camera_offline_evidence.jpg (Offline / Spool Buffer Active)
    # -------------------------------------------------------------
    img4 = np.full((h, w, 3), (15, 23, 42), dtype=np.uint8)
    for gy in range(0, h, 40):
        cv2.line(img4, (0, gy), (w, gy), (25, 35, 60), 1)
    for gx in range(0, w, 40):
        cv2.line(img4, (gx, 0), (gx, h), (25, 35, 60), 1)

    cv2.rectangle(img4, (0, 0), (w, 40), (2, 6, 23), -1)
    cv2.putText(img4, "EDGE AGENT HEALTH MATRIX | OFFLINE RESILIENCE ENGINE", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(img4, "CAM-103-A1 | RANCHI ITI SOLAR LAB", (w - 320, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (239, 68, 68), 1)

    cv2.rectangle(img4, (w // 2 - 260, h // 2 - 70), (w // 2 + 260, h // 2 + 70), (127, 29, 29), -1)
    cv2.rectangle(img4, (w // 2 - 260, h // 2 - 70), (w // 2 + 260, h // 2 + 70), (239, 68, 68), 2)
    cv2.putText(img4, "RTSP CONNECTION LOST - OFFLINE SPOOL ACTIVE", (w // 2 - 230, h // 2 - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (255, 255, 255), 2)
    cv2.putText(img4, "Offline Duration: 45 Minutes | Network Link: DROPPED", (w // 2 - 200, h // 2 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (254, 202, 202), 1)
    cv2.putText(img4, "Local SQLite Spool Buffer: 34 Events Queued (edge/spool.db)", (w // 2 - 225, h // 2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (74, 222, 128), 1)
    cv2.putText(img4, "Auto-Escalated to Jharkhand State Vigilance Directorate", (w // 2 - 210, h // 2 + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (254, 240, 138), 1)

    cv2.imwrite(os.path.join(output_dir, "demo_camera_offline_evidence.jpg"), img4)

    # -------------------------------------------------------------
    # 5. demo_sewing_evidence.jpg (Apparel Workshop Sewing Machine Gap)
    # -------------------------------------------------------------
    img5 = np.full((h, w, 3), (240, 242, 245), dtype=np.uint8)
    cv2.rectangle(img5, (0, 130), (w, h), (210, 215, 220), -1)
    cv2.rectangle(img5, (240, 20), (720, 100), (255, 255, 255), -1)
    cv2.rectangle(img5, (240, 20), (720, 100), (120, 120, 120), 2)
    cv2.putText(img5, "Bhopal Regional Vocational Hub (TC-105) - Apparel & Sewing Bay", (255, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (50, 50, 50), 2)

    # 4 rows x 5 sewing stations
    for i, (dx, dy) in enumerate(desks):
        cv2.rectangle(img5, (dx - 40, dy), (dx + 40, dy + 35), (160, 125, 95), -1)
        if i < 16:
            # Sewing machine outline
            cv2.rectangle(img5, (dx - 18, dy - 20), (dx + 18, dy), (70, 70, 80), -1)
            cv2.circle(img5, (dx - 12, dy - 10), 6, (200, 200, 200), -1)
            cv2.rectangle(img5, (dx - 25, dy - 25), (dx + 25, dy + 10), (34, 197, 94), 2)
            cv2.putText(img5, "sewing_mach: 0.94", (dx - 30, dy - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (34, 197, 94), 1)
        else:
            cv2.rectangle(img5, (dx - 28, dy - 28), (dx + 28, dy + 10), (0, 0, 220), 2)
            cv2.putText(img5, "DEFICIT", (dx - 22, dy - 32), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 220), 1)

    cv2.rectangle(img5, (0, 0), (w, 40), (15, 23, 42), -1)
    cv2.putText(img5, "CENTREWATCH AI | APPAREL SECTOR ASSET VERIFICATION", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(img5, "CAM-105-A1 | BHOPAL HUB | ROOM-105-A", (w - 320, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (56, 189, 248), 1)

    cv2.rectangle(img5, (w // 2 - 250, h - 55), (w // 2 + 250, h - 10), (180, 83, 9), -1)
    cv2.rectangle(img5, (w // 2 - 250, h - 55), (w // 2 + 250, h - 10), (255, 255, 255), 2)
    cv2.putText(img5, "SEWING MACHINE DEFICIT: SANCTIONED 20 | OBSERVED 16", (w // 2 - 235, h - 33), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 2)
    cv2.putText(img5, "Mandate Gap: -4 Units (20.0% Deficit) | Confidence: 89%", (w // 2 - 180, h - 17), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 245, 230), 1)

    cv2.imwrite(os.path.join(output_dir, "demo_sewing_evidence.jpg"), img5)

    # -------------------------------------------------------------
    # 6. demo_healthcare_evidence.jpg (Healthcare / GDA Lab)
    # -------------------------------------------------------------
    img6 = np.full((h, w, 3), (242, 245, 248), dtype=np.uint8)
    cv2.rectangle(img6, (0, 140), (w, h), (220, 225, 230), -1)
    cv2.rectangle(img6, (250, 20), (710, 100), (255, 255, 255), -1)
    cv2.rectangle(img6, (250, 20), (710, 100), (100, 140, 180), 2)
    cv2.putText(img6, "Delhi PMKK Skill Institute (TC-102) - Healthcare & GDA Lab", (265, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 50, 80), 2)

    # Draw clinical beds and student nurses
    for b in range(6):
        bx = 150 + (b % 3) * 260
        by = 200 + (b // 3) * 140
        # Bed
        cv2.rectangle(img6, (bx - 70, by - 25), (bx + 70, by + 45), (200, 215, 225), -1)
        cv2.rectangle(img6, (bx - 70, by - 25), (bx + 70, by + 45), (100, 120, 140), 2)
        cv2.rectangle(img6, (bx - 60, by - 20), (bx - 30, by + 10), (245, 245, 250), -1)
        cv2.putText(img6, f"BED-0{b+1}", (bx - 65, by + 35), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (100, 120, 140), 1)

        # Student nurse by bed
        nx, ny = bx + 45, by + 15
        cv2.ellipse(img6, (nx, ny), (18, 14), 0, 0, 360, (14, 165, 233), -1)
        # Face blur
        cv2.circle(img6, (nx, ny - 24), 13, (210, 215, 225), -1)
        sub_nurse = img6[max(0, ny - 37):min(h, ny - 11), max(0, nx - 13):min(w, nx + 13)]
        if sub_nurse.shape[0] > 0 and sub_nurse.shape[1] > 0:
            blurred_nurse = cv2.GaussianBlur(sub_nurse, (21, 21), 20)
            img6[max(0, ny - 37):min(h, ny - 11), max(0, nx - 13):min(w, nx + 13)] = blurred_nurse
        cv2.circle(img6, (nx, ny - 24), 13, (0, 200, 115), 1)
        cv2.rectangle(img6, (nx - 22, ny - 40), (nx + 22, ny + 20), (34, 197, 94), 2)
        cv2.putText(img6, "nurse: 0.93", (nx - 22, ny - 44), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (34, 197, 94), 1)

    cv2.rectangle(img6, (0, 0), (w, 40), (15, 23, 42), -1)
    cv2.putText(img6, "CENTREWATCH AI | HEALTHCARE SKILL ADJUDICATION AUDIT", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    cv2.putText(img6, "CAM-102-A1 | DELHI PMKK HUB | ROOM-102-A", (w - 340, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (56, 189, 248), 1)

    cv2.rectangle(img6, (w // 2 - 250, h - 55), (w // 2 + 250, h - 10), (16, 185, 129), -1)
    cv2.rectangle(img6, (w // 2 - 250, h - 55), (w // 2 + 250, h - 10), (255, 255, 255), 2)
    cv2.putText(img6, "HEALTHCARE LAB AUDIT: ADJUDICATED & RESOLVED", (w // 2 - 215, h - 33), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 2)
    cv2.putText(img6, "Verified by Officer Verma | Clinical Hospital Posting Early Release Note", (w // 2 - 235, h - 17), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (240, 255, 245), 1)

    cv2.imwrite(os.path.join(output_dir, "demo_healthcare_evidence.jpg"), img6)

    print(f"Generated 6 high-resolution synthetic CCTV evidence snapshots in {output_dir}/")

if __name__ == "__main__":
    create_evidence_images()
