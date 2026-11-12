// Read-only reference sampling. Captures remain local unless redistribution is allowed.
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const [url, out] = process.argv.slice(2);
if (!url || !out || !/^https?:\/\//.test(url))
  throw new Error(
    "Usage: node tools/inspect-reference.mjs https://site.example artifacts/reference",
  );
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const records = [];
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    try {
      const response = await page.goto(url, {
        waitUntil: "load",
        timeout: 30000,
      });
      await page
        .waitForFunction(() => document.fonts.status === "loaded", null, {
          timeout: 10000,
        })
        .catch(() => {});
      const readiness = await page
        .waitForFunction(
          () => {
            let el = document.querySelector("h1");
            if (!el || !el.getBoundingClientRect().height) return false;
            while (el) {
              const s = getComputedStyle(el);
              if (s.opacity === "0" || s.visibility === "hidden") return false;
              el = el.parentElement;
            }
            return true;
          },
          null,
          { timeout: 10000 },
        )
        .then(() => "heading-visible")
        .catch(() => "heading-not-visible");
      const data = await page.evaluate(() => {
        const heading = document.querySelector("h1");
        const style = heading ? getComputedStyle(heading) : null;
        return {
          title: document.title,
          h1: heading?.textContent?.trim(),
          h1_style: style
            ? {
                font: style.fontFamily,
                size: style.fontSize,
                line_height: style.lineHeight,
                color: style.color,
              }
            : null,
          body_background: getComputedStyle(document.body).backgroundColor,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          headings: [...document.querySelectorAll("h2")]
            .slice(0, 8)
            .map((e) => e.textContent.trim()),
        };
      });
      await page.screenshot({
        path: path.join(out, `${width}.png`),
        animations: "disabled",
      });
      records.push({
        width,
        height: 900,
        readiness,
        status: response?.status(),
        final_url: page.url(),
        ...data,
      });
    } catch (e) {
      records.push({ width, error: e.message });
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
const report = {
  url,
  inspected_at: new Date().toISOString(),
  scope:
    "Initial viewport, reduced motion; no interaction, accessibility or performance audit",
  records,
};
await fs.writeFile(
  path.join(out, "inspection.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
