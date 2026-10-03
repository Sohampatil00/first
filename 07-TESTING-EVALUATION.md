# Testing and Evaluation Plan

## Test layers

### Unit tests

Test:
- discrepancy calculations
- tolerance logic
- session state transitions
- inventory calculations
- event severity logic
- offline queue operations

### Integration tests

Test:
- AI service → API
- API → database
- event → dashboard
- evidence upload → review page
- offline queue → resync

### Model tests

Test on held-out scenes and sessions.

## Required test scenarios

- normal classroom
- low attendance
- over-reported attendance
- empty classroom
- people entering/exiting
- occlusion
- crowding
- poor lighting
- low-resolution footage
- machine missing
- machine moved
- machine partly hidden
- object visually ambiguous
- camera frozen
- camera offline
- network outage
- network restoration

## Attendance evaluation

For each session compare ground-truth count against AI count.

### Metrics

`MAE = mean(abs(actual_count - predicted_count))`

Also report:
- exact match rate
- within ±1 count
- within ±2 counts
- precision/recall where an attendance discrepancy label exists

## Infrastructure evaluation

Build a confusion matrix per important class and report:
- precision
- recall
- F1
- mAP where appropriate

## Alert evaluation

Create a manually reviewed set of true anomaly/no-anomaly sessions and measure:
- true positives
- false positives
- true negatives
- false negatives
- precision
- recall

## Acceptance criteria for the demo

The MVP should visibly demonstrate:

1. video is processed
2. people are tracked/countable
3. attendance mismatch is detected
4. sanctioned equipment is compared with observations
5. an alert is generated with evidence
6. the alert appears on the monitoring dashboard
7. the edge agent continues operating during a simulated network outage
8. queued events synchronize after reconnection

## Demo data integrity

Use a labeled demo dataset where the expected outcomes are known. Do not tune thresholds on the exact frames used in the final metric claim.
