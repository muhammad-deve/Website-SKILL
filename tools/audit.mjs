import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { parseArgs } from "./core.mjs";

export const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
export function validateFlows(flows) {
  if (!Array.isArray(flows)) throw new Error("Flows must be an array");
  const names = new Set();
  const actions = [
    "click",
    "fill",
    "select",
    "press",
    "expectText",
    "expectVisible",
    "expectAttribute",
  ];
  for (const flow of flows) {
    if (!/^[a-z0-9-]+$/.test(flow.name) || names.has(flow.name))
      throw new Error("Flow names must be unique slugs");
    names.add(flow.name);
    if (
      !Array.isArray(flow.steps) ||
      !flow.steps.some((s) => s.action?.startsWith("expect"))
    )
      throw new Error(`Flow ${flow.name} needs an assertion`);
    for (const s of flow.steps) {
      if (
        !actions.includes(s.action) ||
        typeof s.selector !== "string" ||
        !s.selector.trim()
      )
        throw new Error("Invalid flow step");
      if (
        ["fill", "select", "expectAttribute"].includes(s.action) &&
        typeof s.value !== "string"
      )
        throw new Error("Step needs a string value");
      if (s.action === "expectText" && typeof s.text !== "string")
        throw new Error("expectText needs text");
      if (s.action === "expectAttribute" && typeof s.attribute !== "string")
        throw new Error("expectAttribute needs attribute");
      if (s.action === "press" && typeof s.key !== "string")
        throw new Error("press needs key");
    }
  }
}
export async function runFlow(page, flow) {
  for (const s of flow.steps) {
    const item = page.locator(s.selector);
    if (s.action === "click") await item.click();
    if (s.action === "fill") await item.fill(s.value);
    if (s.action === "select") await item.selectOption(s.value);
    if (s.action === "press") await item.press(s.key);
    if (s.action === "expectVisible") await item.waitFor({ state: "visible" });
    if (s.action === "expectText")
      await page.waitForFunction(
        ({ selector, text }) =>
          document.querySelector(selector)?.textContent?.includes(text),
        s,
        { timeout: 5000 },
      );
    if (s.action === "expectAttribute")
      await page.waitForFunction(
        ({ selector, attribute, value }) =>
          document.querySelector(selector)?.getAttribute(attribute) === value,
        s,
        { timeout: 5000 },
      );
  }
}
const local = (url) =>
  ["127.0.0.1", "localhost", "[::1]"].includes(new URL(url).hostname);

export async function audit({
  url,
  out,
  flows = [],
  viewports = VIEWPORTS,
  allowRemote = false,
  motion = "reduce",
}) {
  const target = new URL(url);
  if (!["http:", "https:"].includes(target.protocol))
    throw new Error("Use an HTTP(S) URL");
  if (!allowRemote && !local(url))
    throw new Error("External audits require --allow-remote");
  if (!["reduce", "no-preference", "both"].includes(motion))
    throw new Error("Invalid motion setting");
  if (
    !viewports.length ||
    viewports.some(
      (v) =>
        !Number.isInteger(v.width) ||
        !Number.isInteger(v.height) ||
        v.width < 200 ||
        v.height < 200,
    )
  )
    throw new Error("Invalid viewport");
  validateFlows(flows);
  await fs.mkdir(out, { recursive: true });
  const reportPath = path.join(out, "report.json");
  try {
    await fs.access(reportPath);
    throw new Error(
      "Output already contains a report; choose a new directory.",
    );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const report = {
    version: 1,
    url,
    started_at: new Date().toISOString(),
    browser: null,
    capture: {
      animations: "disabled for still screenshots",
      device_scale_factor: 1,
    },
    scope:
      "Only listed pages, states, viewports and axe rules. No full WCAG certification.",
    performance: {
      status: "not-measured",
      reason:
        "No Lighthouse or real-user Core Web Vitals collection in this runner.",
    },
    visual_review: {
      status: "unreviewed",
      reason: "A reviewer must open screenshots and use evals/rubric.json.",
    },
    results: [],
    errors: [],
    passed: false,
  };
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    report.browser = browser.version();
    for (const viewport of viewports)
      for (const reducedMotion of motion === "both"
        ? ["reduce", "no-preference"]
        : [motion]) {
        const context = await browser.newContext({
          viewport,
          deviceScaleFactor: 1,
          reducedMotion,
        });
        const page = await context.newPage();
        page.setDefaultTimeout(7000);
        const runtimeErrors = [];
        const networkFailures = [];
        const consoleErrors = [];
        page.on("pageerror", (e) => runtimeErrors.push(e.message));
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("requestfailed", (r) =>
          networkFailures.push({ url: r.url(), error: r.failure()?.errorText }),
        );
        page.on("response", (response) => {
          if (response.status() >= 400)
            networkFailures.push({
              url: response.url(),
              status: response.status(),
            });
        });
        if (!allowRemote)
          await page.route("**/*", async (route) => {
            const req = route.request();
            if (req.isNavigationRequest() && !local(req.url()))
              await route.abort("blockedbyclient");
            else await route.continue();
          });
        const prefix = `${viewport.width}x${viewport.height}-${reducedMotion}`;
        async function capture(state, failure = null) {
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          const layout = await page.evaluate(() => {
            const width = document.documentElement.clientWidth;
            const overflow = document.documentElement.scrollWidth > width + 1;
            const suspects = [...document.querySelectorAll("body *")]
              .filter((el) => {
                const r = el.getBoundingClientRect();
                const cs = getComputedStyle(el);
                return (
                  r.width > 0 &&
                  cs.visibility !== "hidden" &&
                  (r.right > width + 1 || r.left < -1)
                );
              })
              .slice(0, 20)
              .map((el) => ({
                tag: el.tagName.toLowerCase(),
                id: el.id,
                class: el.className?.toString().slice(0, 150),
              }));
            return {
              overflow,
              viewport_width: width,
              document_width: document.documentElement.scrollWidth,
              candidates: suspects,
              note: "Candidates can include intentional scroll regions or offscreen skip links; inspect before changing.",
            };
          });
          const screenshot = `${prefix}-${state}.png`;
          const buffer = await page.screenshot({
            path: path.join(out, screenshot),
            fullPage: true,
            animations: "disabled",
          });
          report.results.push({
            viewport,
            reduced_motion: reducedMotion,
            state,
            final_url: page.url(),
            screenshot,
            screenshot_sha256: crypto
              .createHash("sha256")
              .update(buffer)
              .digest("hex"),
            layout,
            axe_version: axe.testEngine.version,
            violations: axe.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              help_url: v.helpUrl,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                failure: n.failureSummary,
              })),
            })),
            incomplete: axe.incomplete.map((v) => ({
              id: v.id,
              help_url: v.helpUrl,
              targets: v.nodes.map((n) => n.target),
            })),
            runtime_errors: [...runtimeErrors],
            console_errors: [...consoleErrors],
            network_failures: [...networkFailures],
            interaction_error: failure,
          });
        }
        try {
          const response = await page.goto(url, {
            waitUntil: "load",
            timeout: 30000,
          });
          if (!response || !response.ok())
            throw new Error(`Navigation failed: ${response?.status()}`);
          await page.waitForFunction(
            () => document.fonts.status === "loaded",
            null,
            { timeout: 10000 },
          );
          await capture("initial");
          for (const flow of flows) {
            runtimeErrors.length = 0;
            networkFailures.length = 0;
            consoleErrors.length = 0;
            await page.goto(url, { waitUntil: "load" });
            await page.waitForFunction(
              () => document.fonts.status === "loaded",
            );
            let failure = null;
            try {
              await runFlow(page, flow);
            } catch (e) {
              failure = e.message;
            }
            await capture(flow.name, failure);
          }
        } catch (e) {
          report.errors.push({
            viewport,
            reduced_motion: reducedMotion,
            message: e.message,
          });
        } finally {
          await context.close();
        }
      }
  } catch (e) {
    report.errors.push({ message: e.message });
  } finally {
    if (browser) await browser.close();
  }
  report.finished_at = new Date().toISOString();
  const expected =
    viewports.length * (motion === "both" ? 2 : 1) * (1 + flows.length);
  report.passed =
    report.results.length === expected &&
    report.errors.length === 0 &&
    report.results.every(
      (r) =>
        !r.layout.overflow &&
        !r.violations.length &&
        !r.runtime_errors.length &&
        !r.console_errors.length &&
        !r.network_failures.length &&
        !r.interaction_error,
    );
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
  const rows = report.results.map(
    (r) =>
      `| ${r.viewport.width} | ${r.reduced_motion} | ${r.state} | ${r.layout.overflow} | ${r.violations.length} | ${r.interaction_error ? "failed" : r.state === "initial" ? "not exercised" : "passed"} | [capture](${r.screenshot}) |`,
  );
  await fs.writeFile(
    path.join(out, "report.md"),
    `# Browser audit\n\nURL: ${url}\n\nAutomated gate: **${report.passed ? "passed" : "failed"}**. Visual review: **unreviewed**.\n\n${report.scope}\n\n| Width | Motion preference | State | Overflow | Axe violations | Interaction | Evidence |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\nErrors: ${report.errors.length}. Read report.json for incomplete axe checks, runtime errors and network failures.\n\nPerformance was not measured. Screenshot generation is not visual inspection.\n`,
  );
  return report;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const { flags, positional } = parseArgs(process.argv.slice(2), {
      url: "value",
      out: "value",
      flows: "value",
      widths: "value",
      motion: "value",
      "allow-remote": "boolean",
    });
    if (positional.length || !flags.url)
      throw new Error(
        "Use --url URL [--out directory] [--flows file.json] [--widths 320,390,768,1280,1440,1920] [--motion both]",
      );
    const widths = flags.widths?.split(",").map(Number);
    const result = await audit({
      url: flags.url,
      out: flags.out || `artifacts/audit-${Date.now()}`,
      flows: flags.flows
        ? JSON.parse(await fs.readFile(flags.flows, "utf8"))
        : [],
      viewports: widths?.map((width) => ({ width, height: 900 })),
      allowRemote: flags["allow-remote"],
      motion: flags.motion || "reduce",
    });
    console.log(
      JSON.stringify({
        passed: result.passed,
        states: result.results.length,
        errors: result.errors.length,
        visual_review: "unreviewed",
      }),
    );
    process.exitCode = result.passed ? 0 : 1;
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
