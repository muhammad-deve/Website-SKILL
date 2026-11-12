# Browser and repository tooling

Install dependencies with `npm ci`, then Chromium:

```sh
npx playwright install chromium
npm run preview
```

In a second terminal:

```sh
node tools/audit.mjs --url http://127.0.0.1:4173/operations/ --out artifacts/operations-run1 --flows examples/operations/flows.json --motion both
```

The server exposes only the selected directory on loopback. The audit checks six
widths (320, 390, 768, 1280, 1440, 1920), takes screenshots and scans each initial and
authored flow state with axe. It records overflow, runtime errors, failed requests,
browser/axe versions, capture hashes, motion preference and flow assertion failures.
Each flow starts with a fresh navigation; browser storage persists within that
viewport context. Make flows independent or explicitly account for stored state.
The runner does not infer a primary workflow from arbitrary pages.

`--widths 390,1440` narrows the set. `--motion both` uses normal and reduced
preferences; screenshots disable animations for stable stills, so inspect temporal
behavior separately. External URLs require `--allow-remote`. Use only authorized
targets and flows; actions in a flow can change the tested application. The default
audit has no authored actions and makes no interaction-success claim.

Windows with a workspace-local browser cache:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.cache/browsers'
node node_modules/playwright/cli.js install chromium
npm.cmd run test:browser
```

Set that environment variable in every terminal using the local cache. Otherwise
Playwright uses its normal per-user browser location. Dependencies are pinned;
browser binaries are installed separately. Missing browser support is a failure,
not a silent skipped pass.

## Reports and comparison

An audit writes `report.json`, `report.md` and PNG captures. A new output directory
is required when a report already exists. Exit 0 means the implemented automated
checks passed. It does not mean the design is visually approved or WCAG-conformant.
Read axe incomplete results and perform keyboard, screen-reader and visual review.
Performance is explicitly not measured; Lighthouse and field CWV are future work.

```sh
node tools/compare.mjs before.png after.png artifacts/diff.png 0.01
```

Pixel comparison rejects different image dimensions and writes a highlighted diff.
The optional last argument is the permitted changed-pixel ratio (default 0). Exit 1
means the change exceeds it. This is regression detection, not a beauty judgment.
Match browser, font files, data, state and viewport before comparing.

For read-only research sampling:

```sh
node tools/inspect-reference.mjs https://design-system.service.gov.uk/ artifacts/reference
```

Open the resulting images. A DOM readiness condition can still miss invisible
content; our Linear/Figma attempts demonstrated this limitation. Keep third-party
captures local and record incomplete evidence rather than inventing observations.

`npm run check` validates JSON, style schema, tokens, frontmatter, local Markdown/HTML
links, source IDs and provenance. The Markdown checker supports ordinary inline
links and heading anchors; it is not a full CommonMark parser or external URL checker.
`npm test` exercises retrieval, validation, installation, serving and pixel comparison.
`npm run test:browser` exercises positive and negative browser fixtures and examples.

To preserve compact evidence from a completed browser-test directory, run
`node tools/record-validation.mjs artifacts/tests/browser-RUN`. It verifies expected
positive/negative gate results and writes report hashes, screenshot hashes, tool
versions and targeted accessibility measurements to `evals/results/foundation-validation.json`.
Generated PNGs and full raw reports remain in ignored artifacts.
