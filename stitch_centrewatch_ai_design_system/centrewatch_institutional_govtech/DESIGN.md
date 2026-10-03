---
name: CentreWatch Institutional GovTech
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005a89'
  on-tertiary: '#ffffff'
  tertiary-container: '#0073ae'
  on-tertiary-container: '#e7f2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an authoritative, mission-critical operational interface for national monitoring, compliance analytics, and institutional governance. Designed for deployment across administrative dashboards, field inspection portals, and live telemetry consoles, the system projects rigorous accountability, unwavering clarity, and calm operational focus.

The stylistic foundation fuses **Corporate / Modern GovTech** precision with utilitarian, high-density data presentation:
- **Tone:** Authoritative, uncompromisingly legible, transparent, and structured.
- **Visual Tension:** Crisp, light slate workspaces paired with deep architectural navy chrome (`#0F172A`) to demarcate executive oversight from operative data layers.
- **Hierarchy of Information:** Immediate status recognition via standardized compliance semantics, preventing cognitive overload during critical incident triage.

## Colors

The palette is tuned specifically for sustained daytime readability, audit trace analysis, and zero ambiguity in telemetry monitoring.

### Core Canvas & Structure
- **Canvas Default:** `#F8FAFC` (Slate 50) provides a low-strain, clinical background.
- **Surface Elevation:** `#FFFFFF` pure white surfaces define analytical panels, cards, and inspection matrices.
- **Structural Nav & Headers:** `#0F172A` (Slate 900) anchors system banners, permanent sidebars, and critical system badges.
- **Borders & Partitions:** `#E2E8F0` (Default partition borders), stepping to `#CBD5E1` for actionable or hovered boundaries.

### Typography Contrast
- **Headings & Titles:** `#0F172A` delivers direct 13:1+ AAA contrast.
- **Body Content:** `#334155` ensures legible dense reading across inspection sheets.
- **Secondary & Meta:** `#64748B` anchors audit timestamps, camera IDs, and helper strings.

### Operational Status Tokens
- **Compliant / Verified / Normal:** `#059669` (Core), `#10B981` (Surface hover/accent), with `#ECFDF5` for status badge backgrounds.
- **Review / Cautionary / Warning:** `#D97706` (Core), `#F59E0B` (Accent), with `#FFFBEB` for badge backgrounds.
- **Critical / Anomaly / Breach:** `#DC2626` (Core), `#EF4444` (Accent), with `#FEF2F2` for incident alert fields.
- **Telemetry / AI Pulse / Active Stream:** `#2563EB` (Cobalt primary) and `#0284C7` (Cyan tracking) with `#EFF6FF` container fills.

## Typography

The type system prioritizes structural alignment, accessibility standards, and uninterrupted tabular parsing.

- **Primary Typeface (`Inter`):** Deployed for all structural UI levels, system messages, operational summaries, and action triggers. Numerals within body text inherit tabular figure styling (`font-feature-settings: 'tnum' on, 'cv05' on`).
- **Telemetry & Identity Typeface (`JetBrains Mono`):** Strictly enforced for stream URIs, surveillance camera hashes, Aadhaar/center verification masks, geo-coordinates, and RFC-3339 timestamps. This guarantees mono-spaced vertical scanning across dense auditing grids.
- **Hierarchical Discipline:** Maximum header scale is restrained to `32px` on desktop to retain institutional composure and prevent consumer-style marketing inflation.

## Layout & Spacing

The layout model is governed by a 12-column fluid grid system anchored by strict horizontal and vertical 4px sub-divisions:

- **Desktop (>1280px):** 12 columns, `1.5rem` (`24px`) gutters, `2rem` outer safety canvas margins. Dashboard frames maximize screen utility, avoiding wide, wasteful empty bands.
- **Tablet / Split View (768px – 1279px):** 8 columns, `1rem` (`16px`) gutters, `1.5rem` canvas margins. Side inspection trees collapse into sticky icon docks.
- **Mobile Handheld (<767px):** 4 columns, `0.75rem` gutters, `1rem` outer canvas margin. Tabular datasets pivot into vertically stacked metric ledgers.

Density across component groups is kept compact (`space-xs` to `space-md`) to ensure high visible payload without scrolling on control-room displays.

## Elevation & Depth

To avoid visual pollution and maintain an institutional aesthetic, elevation relies on clean, low-contrast structural boundaries reinforced by faint, neutral-toned ambient shadows. 

- **Level 0 (Base Work surface):** Ground fill `#F8FAFC`, flat, zero elevation.
- **Level 1 (Cards, Monitoring Panels, Data Tables):** Surface `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Dropdown Overlays, Active Filters, Popovers):** Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Audit Traces, Critical Anomaly Overlays):** Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`. Backdrops use `#0F172A` with a 45% alpha channel to focus operator attention without blinding flashes.

## Shapes

The geometric form factor emphasizes restraint and precision through a **Soft (Level 1)** curve radius:

- **Inputs, Buttons, Badges, Tabs:** `4px` (`0.25rem` / `rounded-sm` to `rounded-md`) standard corner radius. No bubbly or high-radius geometries.
- **Cards, Panels, Frame Containers:** `6px` to `8px` (`rounded-md`), retaining an architectural, official demeanor.
- **Data Points & Status Indicators:** Status pips use 50% circle geometry; status badges stay bounded within `4px` rounded rectangular capsules.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, border `1px solid #1D4ED8`. Hover: `#1D4ED8`. Active: `#1E40AF`. Focused: Outline `2px solid #2563EB`, offset `2px`.
- **Secondary / Operational:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #CBD5E1`. Hover: `#F1F5F9`.
- **Destructive (Audit Revocation):** Background `#DC2626`, text `#FFFFFF`, border `1px solid #B91C1C`.
- **Dimensions:** Dense `36px` default height for dashboard controls; `32px` for inline table row actions.

### Status Chips & Badges
- Constructed with a `1px` border, pastel container tint, and high-contrast bold text.
- **Compliant:** Background `#ECFDF5`, border `#A7F3D0`, text `#065F46`, prefix dot `#059669`.
- **Warning:** Background `#FFFBEB`, border `#FDE68A`, text `#92400E`, prefix dot `#D97706`.
- **Critical / Anomaly:** Background `#FEF2F2`, border `#FECACA`, text `#991B1B`, prefix dot `#DC2626`.
- **Telemetry:** Background `#EFF6FF`, border `#BFDBFE`, text `#1E40AF`, prefix dot `#2563EB`.

### Data Tables & Audit Lists
- **Header Row:** Background `#F8FAFC`, border-bottom `1px solid #CBD5E1`, text uppercase `11px`, letter-spacing `0.05em`, color `#64748B`.
- **Row Styling:** Background `#FFFFFF`, border-bottom `1px solid #E2E8F0`, hover state `#F8FAFC`. Zero alternating zebra striping unless the row density exceeds 50 rows per screen.
- **Data Alignment:** Text columns left-aligned; numerical scores, audit totals, and status indicators strictly right-aligned with monospaced tabular numerals (`font-mono`).

### Input Fields & Select Controls
- Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`.
- Height: `36px`, inner padding: `0.5rem 0.75rem`.
- Focus state: Border `#2563EB`, box-shadow `0 0 0 1px #2563EB`.

### Checkboxes & Radios
- Size `16px x 16px`, corner radius `3px` (checkbox) / `50%` (radio).
- Default: Border `1.5px solid #94A3B8`, background `#FFFFFF`.
- Checked: Background `#2563EB`, border `#2563EB`, icon check `#FFFFFF`.

### Cards & Panels
- Background `#FFFFFF`, border `1px solid #E2E8F0`, subtle shadow Level 1.
- Header bars within cards have an explicit separation line (`border-b 1px solid #E2E8F0`) with padding `0.75rem 1rem`.

### Specialized GovTech Components
- **Camera / AI Feed Node:** Video framing container bordered with `#0F172A`, integrated live status pill anchored to top-left (`#DC2626` recording dot + tabular timecode).
- **Incident Escalation Strip:** High-contrast full-bleed bar utilizing a `4px` solid `#DC2626` left accent border with `#FEF2F2` background to signify mandatory officer intervention.