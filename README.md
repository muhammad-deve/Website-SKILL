# Website-SKILL

**A portable design intelligence foundation for agents that build websites.**

Choose a direction from the product and its audience, retrieve only relevant
guidance, implement the interface, then inspect and improve the rendered result.
Claude Code is the first installation target; Codex uses the same canonical core.

This is an implemented **0.1 foundation**, not a completed encyclopedia or a proven
claim of superior model output. The [progress record](docs/PROGRESS.md) tracks what
was built, verified and deferred from the original [brief](promopt.md).

## What works today

- **11 focused skills**, routed through one discoverable `web-design` entrypoint.
- **6 deep style profiles**: Swiss editorial, luxury editorial, industrial brutalism,
  expressive maximalism, technical utilitarian and retro interface. Each covers
  typography, color, composition, assets, components, motion, mobile, accessibility,
  failure modes, tokens and evaluation. [Browse profiles](knowledge/styles/).
- **Bounded search and routing**, explicit style override, transparent no-match
  behavior, CSS token export and opaque-color contrast checks.
- **Research records for all eight requested repositories**, plus additional
  discovery, pinned source revisions and a no-vendoring provenance policy.
- **Browser tooling** for screenshots, axe, overflow, declared task flows, failure
  reporting and pixel comparison. Visual judgment stays separate from measurement.
- **Three original interactive examples** with distinct directions and **12 benchmark
  briefs** with a controlled evaluation protocol. Benchmark comparisons are not run.

## Start

Node.js 22+ is required. From this checkout:

```sh
npm ci
npm run check
npm test
node tools/design.mjs route "Build a brutalist creative portfolio"
node tools/design.mjs search "luxury editorial" --kind styles
```

The router works without npm dependencies; the checks and browser tools need them.
On Windows PowerShell use `npm.cmd` if `npm.ps1` is blocked. A restricted environment
can use `npm.cmd --cache .cache/npm ci`.

## Install in your project

```sh
node tools/install.mjs --agent claude --target /path/to/project
node tools/install.mjs --agent codex --target /path/to/project
```

Use the command for your agent, then start a new session. Invoke `/web-design` in
Claude Code or `$web-design` in Codex. The installer copies one self-contained bundle
and refuses to overwrite existing installations. It preserves the target's root
instructions and adds no hooks. [Project/user installation](docs/installation.md) ·
[Compatibility and untested boundaries](docs/compatibility.md).

## See and verify the examples

```sh
npx playwright install chromium
npm run preview
```

Open `http://127.0.0.1:4173` for an editorial architecture portfolio, an expressive
music festival and an operations workspace. Each is fictional and uses original
assets. In another terminal:

```sh
node tools/audit.mjs --url http://127.0.0.1:4173/operations/ --out artifacts/operations-run1 --flows examples/operations/flows.json --motion both
npm run test:browser
```

The default width set is 320, 390, 768, 1280, 1440 and 1920. Open the screenshots;
capture alone is not visual review. Automated passes do not certify accessibility,
beauty or production performance. [Tooling and Windows cache setup](docs/tooling.md).

Recorded validation: **13 core tests and 5 browser integration tests passed**, with
56 positive state/viewport captures and deliberately failing negative fixtures.
[Evidence and hashes](evals/results/foundation-validation.json) · [Visual review](docs/visual-review.md).

## Explore the system

| Area | Start here |
| --- | --- |
| Agent workflow | [Orchestrator](skills/design-orchestrator/SKILL.md) |
| Shared knowledge | [Design decisions](knowledge/foundations/design-decisions.md), [industry guidance](knowledge/industries.md) |
| Style combinations | [Combining styles](knowledge/styles/combining.md), [coverage taxonomy](knowledge/taxonomy.json) |
| Research | [Implementation comparison](research/repository-audits/comparison.md), [sources](research/sources.json), [method](research/methodology.md) |
| Site references | [Searchable catalog with evidence limits](references/catalog.json) |
| Quality | [Style-aware critique](knowledge/foundations/anti-slop.md), [rubric](evals/rubric.json) |
| Evaluation | [Benchmark briefs](evals/benchmarks.json), [matched-run protocol](evals/protocol.md) |
| Maintenance | [Architecture](docs/architecture.md), [contributing](CONTRIBUTING.md), [continuation plan](docs/PROGRESS.md) |

The taxonomy includes unimplemented research targets; those entries are not complete
style guides. Site evidence is similarly explicit: GOV.UK was visually inspected,
while other entries have narrower text/DOM or archive evidence. This release does
not claim full Claude/Codex runtime validation, cross-browser conformance, Lighthouse
results, or independently reviewed aesthetic improvement.

MIT for original work; the existing copyright is preserved. No third-party skill
implementations or website screenshots are redistributed. See [NOTICE](NOTICE) and
[provenance](research/provenance.json). Dependencies retain their own licenses.
