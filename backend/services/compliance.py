from typing import Dict, Any, Tuple

def evaluate_attendance_discrepancy(
    reported: int, 
    observed: int,
    tolerance_pct: float = 0.15
) -> Tuple[str, str, Dict[str, Any]]:
    """
    Evaluates attendance discrepancy based on Section 3 (Phase 8) of 01-ROADMAP.md.
    Returns (status, severity, payload_dict)
    """
    safe_reported = max(reported, 1)
    diff = reported - observed
    abs_diff = abs(diff)
    rel_diff = abs_diff / safe_reported

    payload = {
        "reported_count": reported,
        "observed_count": observed,
        "difference": diff,
        "absolute_difference": abs_diff,
        "relative_difference_pct": round(rel_diff * 100, 2),
        "tolerance_threshold_pct": round(tolerance_pct * 100, 2)
    }

    if rel_diff <= tolerance_pct:
        return "COMPLIANT", "NORMAL", payload
    elif rel_diff <= 0.25:
        return "DISCREPANCY_MINOR", "REVIEW", payload
    elif rel_diff <= 0.45:
        return "DISCREPANCY_MODERATE", "HIGH", payload
    else:
        return "DISCREPANCY_SEVERE", "CRITICAL", payload

def evaluate_infrastructure_compliance(
    sanctioned: int,
    observed: int,
    item_type: str
) -> Tuple[str, str, Dict[str, Any]]:
    """
    Evaluates infrastructure asset compliance based on Section 3 (Phase 10) of 01-ROADMAP.md.
    Returns (status, severity, payload_dict)
    """
    gap = sanctioned - observed

    payload = {
        "item_type": item_type,
        "sanctioned_quantity": sanctioned,
        "observed_quantity": observed,
        "gap": gap
    }

    if gap <= 0:
        return "COMPLIANT", "NORMAL", payload
    elif gap == 1:
        return "ASSET_GAP_MINOR", "REVIEW", payload
    elif gap <= 3:
        return "ASSET_GAP_MODERATE", "HIGH", payload
    else:
        return "ASSET_GAP_SEVERE", "CRITICAL", payload
