# Implementation comparison

Inspected 2026-11-12. [Source catalog](../sources.json) pins the eight requested
repositories and lists the exact files read. This is a sampled implementation audit,
not an execution benchmark. No upstream scripts were run. Statements about efficacy
below distinguish observed mechanics from author demonstrations.

| Project / author | License observed | Architecture and routing | Useful contribution | Limits and integration decision |
| --- | --- | --- | --- | --- |
| [Emil Kowalski](https://github.com/emilkowalski/skills) | MIT | Separate skills; design engineering guidance and explicit-only animation review | Connect motion purpose, use frequency, interruption and component origin | Some absolute animation rules and prescribed review formatting are opinions. Use a purpose/frequency decision record, not mandatory easing or a universal duration cap. |
| [UI UX Pro Max / Next Level Builder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT at root | Python search over CSV domains; `core.py` config selects searchable and returned columns; stack and RTL qualifiers | Retrieval by semantic outcome; distinguish a design-system request from a targeted fix | Broad catalog is useful but a search hit is not validated fit. Our bounded search exposes matches and misses. Do not import an entire database without row-level evidence review. |
| [Unslop / Damir Sokolovsky](https://github.com/heydamir/unslop) | CC BY 4.0, not MIT | Pass-based redesign, token references and optional story rendering | Preserve product meaning while making spacing, type, copy and state distinctions explicit | Its restrained gradient, weight and motion policies conflict with expressive briefs. Retain diagnosis-before-edit as a concept; do not vendor its skill or assets. |
| [Impeccable / Paul Bakaus](https://github.com/pbakaus/impeccable) | Apache 2.0 | Command router, contextual references, native engine launcher and provider transformers; sampled `providers.js` emits different platform fields | Distinguishes task modes and separates critique from audit; adapters derive from shared content | Native tooling and hooks add distribution complexity. README has an author-produced same-brief comparison, not an independently replicated experiment. Start with a hook-free portable core. |
| [Taste / Ty Farrago](https://github.com/tyfarrago-hub/taste) | Root MIT explicitly defers to vendored licenses | Curated collection of many skills, including design-taste-frontend | Discoverable task vocabulary and aesthetic controls | Sampled skill defaults to React/Next and high variance/motion; bans may fight another installed skill. Packaging is not independent evidence. Use named axes with user choices first. |
| [Taste Skill / Leonxlnx](https://github.com/leonxlnx/taste-skill) | MIT at root | Large asset and script kit, business-kind routing, finish gate, randomized/dealt design options | Makes completion evidence concrete and ties visuals to the actual product | Mandatory screen-height sections, moments and restrictions by business type are strong house preferences. Don't treat randomized differences as originality; borrow the evidence-gate concept only. |
| [Claude Design Skills / Shashidhar Babu](https://github.com/shashidharbabu/claude-design-skills) | Root MIT with per-skill overrides | `design-arsenal` routes among tool and asset skills and sequences a system build | Checks installed stack and asset licensing before integration | Depends on many separately installed tools; README and router counts differ in sampled files. Keep capability checks, avoid unconditional tool dependencies or combining every skill. |
| [Design / Stephane Boghossian](https://github.com/sboghossian/design-skill) | MIT | Single entrypoint, conditional references, direction dials, Playwright instructions | Brief-to-browser loop; category-aware decisions and bounded critique | Sample contains project-specific memory and prescriptive style bans; browser instructions are not a working runner. Keep the sequence, remove borrowed client assumptions, implement executable checks. |

All eight address coding agents, predominantly Claude Code. Several READMEs claim
Codex or other platforms; this review does not validate those claims. Their source
formats and paths are observable; runtime skill activation was not tested.

## Additional discovery

- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design):
  skill and its Apache-2.0 license inspected. Subject-specific art direction and
  plan/build/critique provide a useful short entrypoint. Its lists of saturated
  treatments are contextual judgments, not machine-verifiable quality tests.
- [Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines):
  actual skill inspected. Fetches a live checklist before reviewing code. Small
  entrypoint; requires network and can change between runs. License not audited;
  no code incorporated. Our source records prefer pinned evidence for reproducibility.
- [Google Stitch skills](https://github.com/google-labs-code/stitch-skills): README
  inspected, not implementation-tested. Separate design/build/utility plugins and a
  Stitch MCP dependency. Useful candidate for optional design-to-code integration;
  the core must still work without the service. License not yet verified.

Further candidate discovery: Vercel agent-eval, screenshot-to-code pipelines, Figma
Dev Mode MCP, browser-agent review projects and smaller single-purpose design skills.
These are continuation work, not completed audits.

## Conflict resolution implemented here

1. User constraints and existing product behavior govern the direction.
2. Accessibility and functional correctness are shared checks.
3. A style profile governs visual choices only in its own scope.
4. Industry guidance proposes tradeoffs, never a compulsory palette.
5. A heuristic needs a visible symptom and a reason before it becomes a finding.

There is no basis yet to rank the projects by output quality. Stars, catalog size,
author reputation and attractive demonstrations do not replace matched experiments.
