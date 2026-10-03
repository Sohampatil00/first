# Privacy, Security and Human Review

## Privacy objective

Perform compliance monitoring while minimizing collection and retention of identifiable personal information.

## Default identity policy

Do not perform facial identification unless a separate, lawful requirement and approved system design explicitly requires it.

Default output:
- person count
- temporary track continuity
- presence duration
- occupancy statistics

Avoid:
- face database
- name matching from video
- biometric profiles
- unnecessary continuous raw-video storage

## Data minimization

Prefer retaining:
- counts
- aggregated occupancy
- compliance events
- timestamps
- confidence values
- selected evidence snapshots/clips

Raw video retention should be explicitly configurable by policy rather than assumed to be indefinite.

## Human-in-the-loop

AI must flag and explain. A human reviews consequential events.

```text
AI event
→ evidence
→ reviewer
→ confirm / dismiss
→ action / inspection
```

## Evidence design

Each event should expose:
- centre
- camera
- timestamp
- event type
- model confidence
- observation window
- structured reason
- evidence snapshot
- reviewer status

## Access control

Recommended roles:
- Centre Admin
- District Monitoring Officer
- State Monitoring Officer
- Ministry Monitoring Officer
- System Administrator

Enforce least privilege.

## Audit log

Log:
- login
- configuration changes
- inventory changes
- alert review
- alert resolution
- evidence access
- report generation

## Security controls

- TLS in transit
- encrypted secrets/configuration
- hashed passwords where applicable
- RBAC
- short-lived access tokens
- server-side validation
- API rate limiting
- structured audit logs
- encrypted storage for sensitive evidence

## Important wording rule

Do not write claims such as:

`AI proved the machine is broken.`

Prefer:

`The camera-based system did not observe the sanctioned machine in the configured observation window.`

Similarly, do not treat a visual occupancy estimate as a perfect ground truth count.
