import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, contrast } from "../tools/core.mjs";
import { serve } from "../tools/serve.mjs";
import { audit, VIEWPORTS } from "../tools/audit.mjs";
import { chromium } from "playwright";

const base = path.join(ROOT, "artifacts/tests");
await fs.mkdir(base, { recursive: true });
const run = await fs.mkdtemp(path.join(base, "browser-"));
test(
  "three examples pass their actual task flows at six widths",
  { timeout: 240000 },
  async () => {
    const server = await serve(path.join(ROOT, "examples"));
    try {
      for (const name of ["editorial", "festival", "operations"]) {
        const flows = JSON.parse(
          await fs.readFile(
            path.join(ROOT, `examples/${name}/flows.json`),
            "utf8",
          ),
        );
        const report = await audit({
          url: `${server.url}/${name}/`,
          out: path.join(run, name),
          flows,
          viewports: VIEWPORTS,
        });
        assert.equal(
          report.passed,
          true,
          JSON.stringify(
            {
              name,
              errors: report.errors,
              failures: report.results.filter(
                (r) =>
                  r.layout.overflow ||
                  r.violations.length ||
                  r.runtime_errors.length ||
                  r.console_errors.length ||
                  r.network_failures.length ||
                  r.interaction_error,
              ),
            },
            null,
            2,
          ),
        );
        assert.equal(report.results.length, 18);
        assert.equal(report.visual_review.status, "unreviewed");
        assert.equal(report.performance.status, "not-measured");
      }
    } finally {
      await server.close();
    }
  },
);
test(
  "negative fixture detects overflow, accessibility and failed interaction",
  { timeout: 45000 },
  async () => {
    const fixture = path.join(run, "fixture");
    await fs.mkdir(fixture);
    await fs.writeFile(
      path.join(fixture, "index.html"),
      '<!doctype html><html lang="en"><title>Broken test fixture</title><body><main style="width:1600px"><h1>Test</h1><button id="broken"></button><p id="state">Waiting</p><img src="missing.png" alt="Test fixture"><script>console.error("Deliberate fixture error")</script></main></body></html>',
    );
    const server = await serve(fixture);
    try {
      const report = await audit({
        url: server.url,
        out: path.join(run, "negative"),
        viewports: [{ width: 390, height: 844 }],
        flows: [
          {
            name: "broken-control",
            steps: [
              { action: "click", selector: "#broken" },
              { action: "expectText", selector: "#state", text: "Done" },
            ],
          },
        ],
      });
      assert.equal(report.passed, false);
      assert.ok(report.results[0].layout.overflow);
      assert.ok(
        report.results[0].violations.some((v) => v.id === "button-name"),
      );
      assert.ok(
        report.results[0].network_failures.some((f) => f.status === 404),
      );
      assert.ok(
        report.results[0].console_errors.some((e) =>
          e.includes("Deliberate fixture error"),
        ),
      );
      assert.ok(report.results[1].interaction_error);
    } finally {
      await server.close();
    }
  },
);
test(
  "CSV export contains only the filtered rows and normal-motion mobile layout passes",
  { timeout: 45000 },
  async () => {
    const server = await serve(path.join(ROOT, "examples"));
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
      });
      await page.goto(`${server.url}/operations/`);
      await page.selectOption("#status-filter", "overdue");
      const pending = page.waitForEvent("download");
      await page.click("#export");
      const download = await pending;
      const file = path.join(run, "filtered-invoices.csv");
      await download.saveAs(file);
      const csv = await fs.readFile(file, "utf8");
      assert.match(csv, /Harbor Goods/);
      assert.doesNotMatch(csv, /Cedar Works/);
      assert.equal(csv.split("\r\n").length, 2);
      const report = await audit({
        url: `${server.url}/operations/`,
        out: path.join(run, "operations-normal-motion"),
        viewports: [
          { width: 320, height: 740 },
          { width: 1440, height: 900 },
        ],
        motion: "no-preference",
      });
      assert.equal(report.passed, true, JSON.stringify(report.errors));
    } finally {
      await browser.close();
      await server.close();
    }
  },
);
test(
  "failed navigation produces a saved failed report",
  { timeout: 45000 },
  async () => {
    const server = await serve(path.join(ROOT, "examples"));
    try {
      const report = await audit({
        url: `${server.url}/missing.html`,
        out: path.join(run, "missing"),
        viewports: [{ width: 390, height: 844 }],
      });
      assert.equal(report.passed, false);
      assert.ok(report.errors.length);
      assert.equal(report.results.length, 0);
    } finally {
      await server.close();
    }
  },
);

test("review incomplete contrast targets and keyboard table scrolling", { timeout: 45000 }, async () => {
  const server = await serve(path.join(ROOT, "examples"));
  const browser = await chromium.launch();
  const evidence = [];
  const hex = rgb => "#" + rgb.match(/\d+/g).slice(0, 3).map(n => Number(n).toString(16).padStart(2, "0")).join("");
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    for (const [name, selector] of [["editorial", ".text-link > span"], ["operations", "#rows tr:first-child .amount"]]) {
      await page.goto(`${server.url}/${name}/`);
      if (name === "operations") {
        await page.locator(".table-scroll").focus();
        for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
        await page.waitForFunction(() => {
          const region = document.querySelector(".table-scroll");
          return region.scrollLeft >= region.scrollWidth - region.clientWidth - 2;
        });
      }
      const colors = await page.locator(selector).evaluate(el => {
        const foreground = getComputedStyle(el).color;
        let node = el; const backgrounds = [];
        while (node) { backgrounds.push(getComputedStyle(node).backgroundColor); node = node.parentElement; }
        return { foreground, backgrounds };
      });
      const background = colors.backgrounds.find(c => /^rgb\(/.test(c));
      assert.ok(background, "Need a verified opaque background rather than assuming a canvas color");
      const ratio = contrast(hex(colors.foreground), hex(background));
      assert.ok(ratio >= 4.5);
      await page.screenshot({ path: path.join(run, `${name}-contrast-review.png`), fullPage: true });
      evidence.push({ page: name, selector, ...colors, opaque_background: background, ratio, keyboard_scroll_tested: name === "operations" });
    }
    await fs.writeFile(path.join(run, "targeted-accessibility.json"), JSON.stringify(evidence, null, 2));
  } finally { await browser.close(); await server.close(); }
});
