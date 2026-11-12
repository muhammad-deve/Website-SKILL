---
name: layout-composition
description: "Improve website hierarchy, alignment, spacing, responsive composition and information density."
---

# Layout and composition

Identify the main decision, supporting proof and next action. Place them by priority
before selecting a grid. Use grouping and alignment to express relationships;
containers are useful when they encode a shared task or state.

Read [foundations](../../knowledge/foundations/design-decisions.md) and the selected
profile's composition/mobile sections. Use shared spacing roles, not arbitrary gaps.
A repeated row or card is appropriate for comparable content; repetition alone is
not a defect. Novelty must not make navigation unpredictable.

Inspect at 320, 390, 768, 1280 and 1440 CSS pixels; add wide desktop when useful.
Check long labels, empty and full content, zoom and reading order.
Do not hide overflow globally to conceal a broken grid. If a table needs two axes,
contain and label its scroll region. Prefer content-driven breakpoints.

Propose changes as hypotheses: a narrower measure should improve reading; reducing
hero height should expose useful proof. Re-render to assess each meaningful batch.
