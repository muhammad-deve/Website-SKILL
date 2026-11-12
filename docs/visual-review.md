# Example review — 2026-11-12

Reviewer: the implementation agent, not an independent human panel. Evidence is
local under `artifacts/tests/browser-YI6p08/` (initial pass) and
`artifacts/tests/browser-Iz1Val/` (refinement pass). Later verification report locations
and screenshot hashes are recorded in `evals/results/foundation-validation.json`.
Third-party research screenshots
are separate and are not distributed.

## Scope actually inspected

Opened full-page initial-state PNGs for all three examples at 1440×900 and 390×844.
After the operations refinement, opened its 390×844 reduced-motion capture and
320×740 normal-motion capture. Automated flows exercise details expansion, keyboard
entry through a skip link, day filtering, saved-state feedback, overdue filtering,
empty-state recovery and filtered CSV download. These are not complete keyboard,
screen-reader or live animation reviews.

Targeted follow-up used keyboard arrows to reach the right edge of the mobile invoice
table, then opened the resulting capture. Computed foreground/background pairs for
the editorial arrow and invoice amount text measured approximately 16.09:1 and
15.85:1. This addresses those sampled axe-incomplete targets; it does not reclassify
the entire accessibility scan as complete. The offscreen skip link was also given
explicit nonfocused transparency to prevent a full-page capture artifact when the
page is scrolled. Keyboard focus still reveals it.

## Observations and iteration

| Example | Observed strengths | Concern and action | Limits |
| --- | --- | --- | --- |
| Field Office | Shared edges, legible project hierarchy and original spatial diagrams; mobile keeps the reading sequence | No blocking visual defect in sampled captures | Concept diagrams are appropriate to this fictional brief; real portfolio proof and final brand fonts remain project-specific |
| Common Frequency | Color-field changes separate program, visitor details and passes; display type and record motif support music context | No blocking visual defect in sampled captures | This is a restrained subset of maximalism, not a demonstration of all expressive techniques |
| Relay | Currency, dates, status labels and task controls have distinct roles | Initial mobile KPI stack pushed the overdue action down; compact metric rows reduce that height. Added visible sideways-scroll guidance for the data table | Table still intentionally scrolls horizontally on narrow screens; no production financial integration |

Hypothesis tested: reducing the mobile KPI block while preserving number size should
bring the overdue action closer to the main task. The subsequent 390px capture shows
the whole overdue action within the 844px initial viewport, whereas the initial
capture placed part of the alert/action below it. At 320px, the layout still needs
vertical scrolling, but the metric hierarchy and labels remain readable. No global
overflow-hiding rule was used to mask layout problems.

These observations support the implementation examples only. They do not establish
conversion gains, aesthetic superiority, or full accessibility. No numeric beauty
scores were assigned. Use the controlled benchmark protocol for comparative claims.
