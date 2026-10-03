# Master Stitch Prompt — Complete Product UI/UX

Use the following as the master prompt for Google Stitch (or another AI UI generator). Generate the entire product as one coherent design system, not a collection of unrelated screens.

```text
Design a complete, production-grade GovTech web application named “CentreWatch AI” for the Ministry of Skill Development and Entrepreneurship (MSDE).

Product purpose:
CentreWatch AI is a privacy-preserving AI video analytics platform that helps authorized monitoring teams oversee government-funded training centres. It estimates attendance from camera feeds, compares observed presence with attendance reported by a centre, checks approved infrastructure against camera observations, flags discrepancies, and provides evidence for human review.

This is NOT a surveillance aesthetic. The visual language should communicate trust, accountability, operational clarity, privacy, and modern AI infrastructure.

CORE PRODUCT PRINCIPLES
- Privacy first: no facial recognition or personal identity matching by default.
- Human in the loop: AI flags observations; authorized humans review consequential alerts.
- Evidence over speculation: every alert explains the observation window, camera, confidence, and reason.
- Low bandwidth: centre-side edge processing sends metadata/events and selected evidence rather than relying on continuous cloud video streaming.
- Government-grade clarity: precise tables, clear statuses, auditability, accessibility and restrained visual effects.

VISUAL DIRECTION
Create a premium modern GovTech dashboard with a dark-first interface and an optional light theme.
Use a deep neutral background, elevated panels, thin borders, soft shadows, restrained accent colors, crisp typography, subtle grid/technical motifs and minimal glass effects.
Avoid gamer aesthetics, excessive neon, giant gradients, cartoon illustrations and excessive rounded cards.
Use color primarily for status semantics:
- green = normal/compliant
- amber = review/warning
- red = high-priority anomaly
- blue = informational/AI activity
Do not use color as the only status indicator; pair it with labels/icons.

TYPOGRAPHY
Use a clean modern sans-serif such as Inter/Manrope/Geist.
Large numeric KPIs, compact table typography, strong page titles, clear section labels and readable helper text.
Use tabular numerals for metrics.

GLOBAL APP SHELL
Desktop layout:
- left collapsible navigation rail
- top command/header bar
- main content area
- optional right-side context drawer on detail/review screens

Navigation:
1. Overview
2. Centres
3. Live Cameras
4. Attendance
5. Infrastructure
6. Alerts
7. Reports
8. Analytics
9. Audit Log
10. Settings

Top bar:
- global search
- selected geography/filter
- network/sync status
- notifications
- help
- user/profile menu

GLOBAL COMPONENTS
Create a reusable design system containing:
- KPI cards
- status badges
- severity chips
- data tables
- filter bars
- tabs
- date/session pickers
- dropdowns
- search
- pagination
- charts
- maps
- camera cards
- evidence viewer
- alert timeline
- activity log
- empty states
- loading skeletons
- confirmation dialogs
- side drawers
- command/search palette
- toasts
- tooltips
- accessibility focus states

SCREEN 1 — OVERVIEW / NATIONAL MONITORING COMMAND CENTRE
Create a high-information executive dashboard.
Header:
“Training Centre Monitoring”
Subtitle: “AI-assisted attendance and infrastructure compliance”

Top KPI strip:
- Total Centres
- Centres Online
- Attendance Compliance
- Infrastructure Compliance
- Open Alerts
- Camera Health

Main region:
Left: interactive India/region map with centre markers and severity status.
Right: “Priority Alerts” list with centre, issue, severity, age and action.

Middle:
- attendance compliance trend chart
- infrastructure compliance trend chart
- alert volume over time

Bottom:
“Centres Requiring Attention” table:
Centre | District | Attendance | Infrastructure | Camera Health | Open Alerts | Last Observation | Status

Add a subtle live-data indicator, “AI pipeline operational”, and last-sync timestamp.

SCREEN 2 — CENTRES
Create a searchable/filterable centre directory.
Controls:
- search
- state
- district
- status
- compliance range
- last-seen

Table/card hybrid with:
Centre ID, Centre Name, District, Capacity, Attendance %, Infrastructure %, Camera %, Open Alerts, Last Seen, Status.

Support bulk filter and export actions.

SCREEN 3 — CENTRE DETAIL
Header:
Centre name + Centre ID + district/location + current compliance status.

Hero summary:
- Attendance compliance
- Infrastructure compliance
- Camera health
- Open alerts

Tabs:
Overview | Attendance | Infrastructure | Cameras | Alerts | Audit

Overview content:
- recent alerts timeline
- attendance trend
- infrastructure gaps
- camera health panel
- sanctioned capacity
- current session summary

SCREEN 4 — LIVE CAMERAS
Design a professional camera monitoring workspace.
Grid of camera cards with:
- camera name
- room
- online/offline status
- FPS/network health
- people count
- current session

Click a camera to open a detailed view.

Detailed camera page:
- large video area
- AI bounding boxes as an optional overlay
- temporary tracking IDs, never personal names
- zone outlines
- people count
- equipment count
- inference FPS
- edge/device status
- last sync
- event markers on timeline

Include a visible privacy banner:
“Privacy mode: aggregate presence detection. No facial identification.”

SCREEN 5 — ATTENDANCE
Create an attendance intelligence page.
Top:
- date/session selector
- centre selector
- classroom selector

KPI row:
Reported Attendance | AI Observed | Difference | Discrepancy Rate | Sessions Reviewed

Main chart:
Reported vs observed attendance over time.

Table:
Session | Reported | Observed | Difference | Observation Confidence | Camera | Status | Review

Use a detail drawer to show the observation timeline and evidence without identifying people.

SCREEN 6 — INFRASTRUCTURE
Create an inventory compliance workspace.
Top KPI:
Required Items | Observed | Missing | Uncertain | Compliance %

Main table:
Item | Required | Observed | Missing | Confidence | State | Last Seen | Review

Show item-level visual cards for important equipment with small evidence snapshots.

States:
PRESENT
UNCERTAIN
NOT OBSERVED
ACTIVE CUE
INACTIVE CUE

Use careful wording: camera analytics can indicate visual presence/activity cues; it does not guarantee mechanical functionality.

SCREEN 7 — ALERTS
Create a professional alert inbox similar to an enterprise operations centre.

Filters:
Severity | Type | Centre | District | Status | Date | Confidence

Table:
Severity | Alert | Centre | Camera | Time | Confidence | Status | Action

Right-side detail drawer:
- alert title
- human-readable reason
- reported vs observed values
- evidence image/video thumbnail
- observation window
- confidence
- related events
- audit trail
- reviewer actions

Actions:
Review
Confirm
Dismiss
Resolve
Assign

Do not use threatening language. Use neutral operational wording.

SCREEN 8 — ALERT DETAIL / EVIDENCE REVIEW
Full-screen review page.
Left:
large evidence viewer with timeline.
Right:
structured facts:
Centre
Camera
Timestamp
Observation Window
AI Observation
Expected Value
Observed Value
Difference
Confidence
Event Type

Below:
“Why was this flagged?” explanation.

Provide reviewer controls:
Confirm observation
Mark uncertain
Dismiss
Escalate for inspection
Add review note

SCREEN 9 — REPORTS
Create report-generation UI.
Report types:
- Daily Centre Summary
- District Compliance Summary
- Attendance Discrepancy Report
- Infrastructure Gap Report
- Camera Health Report

Controls:
Date range, geography, centre, severity and status.
Show preview before export.

SCREEN 10 — ANALYTICS
Create an analytics page for trends and recurring patterns.
Charts:
- attendance compliance trend
- infrastructure compliance trend
- alerts by category
- alerts by district
- camera uptime
- average review time
- repeated anomalies by centre

Add a “Pattern Detected” insight panel, but clearly label insights as AI-assisted analytics rather than definitive findings.

SCREEN 11 — AUDIT LOG
Dense enterprise table:
Timestamp | User | Action | Entity | Centre | Before | After | Source

Include filters and export.

SCREEN 12 — SETTINGS
Sections:
- Users & Roles
- Centre Configuration
- Camera Configuration
- Inventory Rules
- Alert Thresholds
- Privacy & Retention
- Edge Devices
- Notification Settings
- System Health

Show clear warnings before changing high-impact rules.

EDGE DEVICE MANAGEMENT UI
Create a separate device panel showing:
Device ID
Centre
CPU/GPU utilization
Memory
Inference FPS
Camera connections
Network status
Queued events
Last successful sync
Software version

Provide a clear offline indicator and “X events waiting to sync”.

RESPONSIVE BEHAVIOR
Desktop is the primary use case.
Also design tablet/mobile layouts.
On mobile:
- collapsible navigation
- stacked KPIs
- horizontally scrollable dense tables
- full-screen evidence viewer
- bottom sheets/drawers for details

MICROINTERACTIONS
Use subtle animations only:
- live pulse on online AI status
- chart transitions
- alert arrival highlight
- loading skeletons
- drawer transitions
Avoid distracting constant motion.

EMPTY / ERROR / OFFLINE STATES
Design all of them explicitly.
Examples:
- No alerts today
- No camera signal
- Camera offline
- No data for selected session
- Edge device offline with queued events
- AI observation unavailable
- Evidence unavailable

PRIVACY UX
Make privacy visible but not intrusive.
Include a small privacy status component across camera-related screens:
“Aggregate presence mode · Facial identification disabled”

ACCESSIBILITY
- WCAG-conscious contrast
- visible keyboard focus
- semantic labels
- icon + text for status
- avoid color-only meaning
- reasonable font sizes

DATA VISUALIZATION STYLE
Charts should be clean and restrained.
Use line charts for trends, bars for comparison, donut only for compact composition, and tables whenever precision matters.
Always show units, time range and empty states.

DESIGN OUTPUT
Generate:
1. complete design system
2. desktop screens
3. responsive screens
4. shared navigation/components
5. interactive states
6. alert/evidence review flow
7. live camera flow
8. centre detail flow
9. settings/admin flow

Create the whole product as a coherent app with consistent spacing, typography, components, interaction patterns and information hierarchy.
The result should look like a real government operations platform that could be deployed, not a conceptual AI landing page.
```

## Optional Stitch follow-up prompt — improve the first generation

```text
Now audit the generated CentreWatch AI interface as a senior product designer.

Do not change the product scope.
Improve information hierarchy, density, accessibility, table usability, alert review flow, camera monitoring usability, responsive behavior, empty/error/offline states and consistency of components.

Make the experience feel like a mature GovTech operations product rather than a generic SaaS dashboard.
Reduce unnecessary decoration and prioritize operational decisions, evidence and traceability.
```
