import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  ROOT,
  route,
  search,
  contrast,
  safePath,
  parseArgs,
  profiles,
  tokenCSS,
} from "../tools/core.mjs";
import {
  validate,
  validateFrontmatter,
  checkLinks,
} from "../tools/validate.mjs";

test("realistic briefs route to different philosophies", () => {
  assert.equal(
    route("Build a brutalist creative portfolio").styles[0].id,
    "industrial-brutalism",
  );
  assert.equal(
    route("Build a luxury watch shop").styles[0].id,
    "luxury-editorial",
  );
  assert.equal(
    route("Build a fintech dashboard").styles[0].id,
    "technical-utilitarian",
  );
  assert.equal(
    route("Build a maximalist music festival").styles[0].id,
    "expressive-maximalism",
  );
});
test("explicit selection overrides lexical guesses; unknown inputs remain honest", () => {
  assert.equal(
    route("Build a brutalist interface", { style: "luxury-editorial" })
      .styles[0].id,
    "luxury-editorial",
  );
  assert.throws(() => route("x", { style: "unknown" }), /Unknown style/);
  assert.equal(route("quasar aqueduct").confidence, "no-match");
  assert.ok(route("quasar aqueduct").gaps.length);
  assert.throws(() => route(" "));
  assert.match(route("no brutalism").warning, /negations/);
});
test("retrieval is bounded, stable, exposes evidence and no-match", () => {
  assert.deepEqual(search(""), []);
  assert.equal(search("quasar aqueduct").length, 0);
  assert.equal(route("Build a solarpunk museum").confidence, "no-match");
  assert.ok(route("Build a solarpunk portfolio").gaps.some(gap => gap.includes("Solarpunk")));
  assert.equal(search("a website with a page").length, 0);
  assert.equal(
    search("Lusion", { kind: "references" })[0].evidence,
    "document-inspection",
  );
  const result = search("editorial typography", { kind: "styles", limit: 1 });
  assert.equal(result.length, 1);
  assert.ok(result[0].matched.length);
  assert.ok(result[0].sources.length);
  assert.deepEqual(
    result,
    search("editorial typography", { kind: "styles", limit: 1 }),
  );
  assert.equal(route("Redesign this dashboard").intent, "redesign");
  assert.equal(route("Audit keyboard accessibility").intent, "audit");
});
test("contrast uses linearized sRGB and refuses ambiguous input", () => {
  assert.equal(contrast("#000000", "#ffffff"), 21);
  assert.equal(contrast("#123456", "#123456"), 1);
  assert.ok(Math.abs(contrast("#777777", "#ffffff") - 4.478) < 0.01);
  assert.throws(() => contrast("transparent", "#ffffff"));
  assert.throws(() => contrast("#fff", "#000000"));
  for (const p of profiles()) assert.match(tokenCSS(p), /--on-accent:/);
});
test("path and argument handling reject traversal and malformed switches", () => {
  assert.throws(() => safePath(ROOT, "../outside"), /escapes/);
  assert.throws(() => parseArgs(["--wat"], {}), /Unknown/);
  assert.throws(() => parseArgs(["--style"], { style: "value" }), /Missing/);
  assert.throws(() => parseArgs(["--a", "--a"], { a: "boolean" }), /Repeated/);
});
test("frontmatter detects duplicates, wrong folder and unsupported platform fields", () => {
  const body = "\nGuidance ".repeat(30);
  assert.deepEqual(
    validateFrontmatter(
      '---\nname: sample\ndescription: "A sufficiently useful discovery description."\n---\n' +
        body,
      "sample",
    ),
    [],
  );
  assert.ok(
    validateFrontmatter(
      "---\nname: sample\nname: again\n---\n" + body,
      "sample",
    ).length,
  );
  assert.ok(
    validateFrontmatter(
      "---\nname: sample\ndescription: 5\nhooks: x\n---\n" + body,
      "other",
    ).length >= 3,
  );
});
test("repository links, schemas, source references and token pairs validate", () => {
  const result = validate(ROOT);
  assert.deepEqual(result.errors, []);
  assert.equal(result.styles, 6);
  assert.equal(result.skills, 11);
});
test("validator catches broken links and anchors", async () => {
  const base = path.join(ROOT, "artifacts/tests");
  await fs.mkdir(base, { recursive: true });
  const dir = await fs.mkdtemp(path.join(base, "links-"));
  await fs.writeFile(path.join(dir, "target.md"), "# Present\n");
  const file = path.join(dir, "sample.md");
  await fs.writeFile(
    file,
    "[ok](target.md#present)\n[bad](target.md#absent)\n[missing](gone.md)\n",
  );
  assert.equal(checkLinks(file, dir).length, 2);
});
test("schema and cross-reference checks fail on damaged data", async () => {
  const base = path.join(ROOT, "artifacts/tests");
  await fs.mkdir(base, { recursive: true });
  const dir = await fs.mkdtemp(path.join(base, "invalid-"));
  for (const name of [
    "knowledge",
    "research",
    "references",
    "schemas",
    "evals",
  ])
    await fs.cp(path.join(ROOT, name), path.join(dir, name), {
      recursive: true,
    });
  const file = path.join(dir, "knowledge/styles/swiss-editorial.json");
  const p = JSON.parse(await fs.readFile(file, "utf8"));
  delete p.mobile;
  p.sources.push("invented-source");
  await fs.writeFile(file, JSON.stringify(p));
  const errors = validate(dir).errors.join("\n");
  assert.match(errors, /mobile/);
  assert.match(errors, /invented-source/);
});
