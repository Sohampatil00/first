# AI Pipeline

## Model pipeline

```text
Video
 ↓
Frame sampler
 ↓
Object detector
 ├── person
 └── infrastructure classes
 ↓
Tracker
 ↓
ROI / zone rules
 ↓
Temporal aggregation
 ↓
Attendance + inventory engines
 ↓
Compliance events
```

## Detection

Start from a pretrained detector and fine-tune on the provided/simulated centre footage.

Use confidence thresholds and class-specific thresholds where needed.

## Tracking

Use a multi-object tracker so repeated detections of the same person/object across frames are not counted as separate entities.

Tracking IDs are temporary technical IDs and should not become a substitute for personal identity.

## Attendance state machine

```text
NOT_SEEN
   ↓
DETECTED
   ↓
IN_ZONE
   ↓
DWELL_THRESHOLD_REACHED
   ↓
PRESENT
   ↓
LEFT_ZONE
```

## Infrastructure state machine

```text
NOT_OBSERVED
  ├── seen consistently → PRESENT
  ├── partially occluded → UNCERTAIN
  └── absent across confirmation window → NOT_OBSERVED
```

## Temporal confirmation

Never create a compliance event from a single noisy frame when a multi-frame confirmation is possible.

Example:

```text
machine missing for one frame
→ ignore

machine absent for confirmation window
→ candidate event

candidate persists / confidence is adequate
→ compliance event
```

## Apparent operation

Video can sometimes provide visual cues of use/activity, but it should not be described as a definitive mechanical inspection.

Possible cues:
- visible user interaction
- moving component
- visible indicator/display
- repeated activity across time

Output states should be:

`ACTIVE_CUE`, `INACTIVE_CUE`, `PRESENT_ONLY`, `UNCERTAIN`

## Metrics

### Detection
- precision
- recall
- F1
- mAP

### Counting
- MAE
- median absolute error
- percentage within tolerance

### Compliance events
- precision
- recall
- false-positive rate
- false-negative rate

## Dataset split

Use a representative split by scene/centre/session rather than randomly splitting adjacent video frames only. This avoids overly optimistic evaluation from near-duplicate frames.

## Confidence policy

Expose model confidence to reviewers, but do not equate confidence with certainty or policy compliance.
