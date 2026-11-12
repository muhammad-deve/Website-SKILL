# Controlled evaluation protocol

The three authored examples are smoke fixtures and design demonstrations. They are
not unassisted baselines or evidence of model improvement. All twelve challenges in
[benchmarks.json](benchmarks.json) currently have `not-run` status.

## Matched experiment

For each challenge, freeze the full brief, assets, functional requirements, stack,
model identifier, reasoning setting, agent version, tools, time/token budget and
viewport set. Use clean isolated directories and separate fresh sessions. Condition
A gets the brief and tools; condition B additionally gets this skill bundle at a
recorded commit. Do not manually weaken A. Do not let either session read the other
output. Rotate condition order and repeat across several runs; record seeds when
supported. Include a selected upstream skill only after its license/install scope is
reviewed, using the same tools and budget.

Record prompt, model, budget actually used, timings, output revision, errors, changes
and every intervention. A blocked condition remains blocked, not a fabricated score.
Run identical browser checks and interaction assertions for both outputs. Preserve
screenshots with hashes and runtime metadata. Label missing checks explicitly.

## Review

Give reviewers anonymized artifacts in randomized order, the brief, and the
[rubric](rubric.json). Gather at least two independent human reviews when feasible;
record reviewer count and disagreement. Without human review, label agent critique
as such. Review accessibility evidence and task completion separately from aesthetics.

Report all runs, including failures and cases where the baseline or another skill
wins. Do not generalize from one selected screenshot. Compare paired dimensions and
task failures; avoid a single aesthetic average that conceals inaccessible controls.
Use disagreement to revise a narrow rule, then run new held-out briefs.

## Run record

Store each experiment in `artifacts/benchmarks/<challenge>/<condition>/<run>/` with
`run.json`, source snapshot, browser report, screenshots and reviewer notes. Record:
challenge, condition, run ID, brief hash, skill commit, model, agent version, tools,
budget limit/usage, seed or null, started/finished timestamps, result revision,
objective report path, visual review status, interventions and blockers.
Promote only original result metadata suitable for redistribution into `evals/results/`.
