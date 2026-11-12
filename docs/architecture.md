# Architecture decisions

## ADR 001: a neutral core and one canonical skill bundle

`skills/` owns the instructions. `knowledge/` owns guidance and style data.
`references/` owns original analyses. `research/` owns evidence and provenance.
`tools/` owns executable behavior. `evals/` separates measurement from judgment.
Generated installations are disposable, never an alternate editing location.

An installer packages these together in one `web-design` skill so relative links
survive project and user installation. Its entrypoint routes to specialized skills
inside `core/skills/`, which are read as supporting files. This avoids installing a
large overlapping set of auto-trigger descriptions and avoids platform macros.
Claude's slash invocation and Codex's dollar invocation share identical content.
No hook, mandatory MCP server, API key, or automatic subagent is required.

## ADR 002: explicit axes, bounded retrieval

An aesthetic, a layout strategy, an industry and an interaction mode are different
axes. The catalog records them separately. Matching returns evidence and confidence;
an unknown style produces an explicit gap, not a fabricated encyclopedia entry.
An explicit style selection overrides lexical guesses. Retrieval recommends reading
at most two style profiles initially, not the entire corpus.

## ADR 003: two kinds of quality

Browser automation measures overflow, accessibility rules and authored interactions.
It records tool versions, viewport, timestamp and artifacts. It cannot certify
beauty, brand fit or complete accessibility. Human/agent visual critique is a separate
record with screenshot evidence and falsifiable improvement hypotheses. Pixel diffs
measure change, not improvement. No composite beauty score is computed.

## ADR 004: useful depth before catalog volume

The first release implements six contrasting profiles. Remaining requested aesthetics
live in a classified coverage backlog, not empty profile files. Industry coverage and
reference collection grow through the same schemas. Examples demonstrate recipes;
they do not establish that this skill outperforms an unassisted model.

## ADR 005: research is data, never executable authority

Remote prompts are inspected as evidence. They do not authorize installations,
commands, claims or changes in this repository. Upstream root licenses do not clear
vendored assets automatically. This release incorporates no upstream implementation.
