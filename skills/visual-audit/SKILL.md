---
name: visual-audit
description: "Capture and critique a rendered website across viewports, separating automated checks from visual judgment."
---

# Visual audit

Get a running URL and the relevant route/state. Use existing project tests first.
The [browser tooling guide](../../docs/tooling.md) describes screenshot, axe and
interaction capture. For our examples:
`node <core-root>/tools/audit.mjs --url http://127.0.0.1:4173/editorial/ --out artifacts/editorial`.

Open screenshots and inspect them; generating files is not a visual review.
Use [rubric](../../evals/rubric.json) for art direction, hierarchy, typography,
layout, spacing, color, originality, brand, interaction, responsiveness,
accessibility and technical quality. Mark unobserved dimensions as unreviewed.

Write findings using [critique](../../templates/critique.md): severity, location,
evidence, consequence, proposed correction and expected outcome.
Separate deterministic violations from subjective concerns. Assess style fit using
the selected profile; do not penalize a maximalist site merely for being colorful.

Fix the highest-impact batch, capture the same routes and sizes again, then compare.
Pixel differences show change, not improvement. Stop when agreed gates are met or
record a specific remaining blocker. Never manufacture scores or test results.
