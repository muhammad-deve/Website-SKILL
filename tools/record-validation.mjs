// Preserve reproducible metadata without distributing every generated screenshot.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ROOT } from "./core.mjs";

const input = process.argv[2];
if (!input) throw new Error("Usage: node tools/record-validation.mjs artifacts/tests/browser-RUN");
const directory = path.resolve(input);
const names = ["editorial", "festival", "operations", "operations-normal-motion", "negative", "missing"];
const reports = [];
for (const name of names) {
  const file = path.join(directory, name, "report.json");
  const bytes = await fs.readFile(file);
  const report = JSON.parse(bytes);
  if (report.passed !== !["negative", "missing"].includes(name)) throw new Error(`Unexpected gate result: ${name}`);
  reports.push({
    name,
    report: path.relative(ROOT, file).replaceAll("\\", "/"),
    report_sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    passed: report.passed,
    browser: report.browser,
    started_at: report.started_at,
    finished_at: report.finished_at,
    states: report.results.length,
    errors: report.errors.length,
    axe_versions: [...new Set(report.results.map(r => r.axe_version))],
    violation_instances: report.results.reduce((n, r) => n + r.violations.length, 0),
    incomplete_rule_instances: report.results.reduce((n, r) => n + r.incomplete.length, 0),
    screenshots: report.results.map(r => ({ file: r.screenshot, sha256: r.screenshot_sha256, viewport: r.viewport, state: r.state, motion: r.reduced_motion }))
  });
}
const targeted = JSON.parse(await fs.readFile(path.join(directory, "targeted-accessibility.json"), "utf8"));
const sourceFiles = [];
async function collect(dir) {
  for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(file);
    else sourceFiles.push(file);
  }
}
for (const name of ["tools", "tests", "examples"]) await collect(path.join(ROOT, name));
sourceFiles.push(path.join(ROOT, "package-lock.json"));
const digest = crypto.createHash("sha256");
for (const file of sourceFiles) { digest.update(path.relative(ROOT, file).replaceAll("\\", "/")); digest.update("\0"); digest.update(await fs.readFile(file)); }
const result = {
  version: 1, recorded_at: new Date().toISOString(), node: process.version, platform: process.platform,
  source_digest_sha256: digest.digest("hex"),
  source_digest_scope: "Sorted tools, tests, examples, then package-lock.json; path + NUL + file bytes",
  reports, targeted_accessibility: targeted,
  interpretation: "Positive automated fixtures passed and negative fixtures failed as intended. Visual review is a separate agent-authored sample in docs/visual-review.md. No controlled model benchmark, full WCAG certification, screen-reader, cross-browser or performance result is claimed."
};
const output = path.join(ROOT, "evals/results/foundation-validation.json");
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.log(`Saved ${reports.length} report summaries to ${output}`);
