import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { PNG } from "pngjs";
import { ROOT } from "../tools/core.mjs";
import { install } from "../tools/install.mjs";
import {
  validate,
  checkLinks,
  validateFrontmatter,
} from "../tools/validate.mjs";
import { serve } from "../tools/serve.mjs";
import { compare } from "../tools/compare.mjs";
import { validateFlows } from "../tools/audit.mjs";

async function temp(name) {
  const base = path.join(ROOT, "artifacts/tests");
  await fs.mkdir(base, { recursive: true });
  return fs.mkdtemp(path.join(base, name));
}
test("Claude and Codex bundles preserve content, links and existing user instructions", async () => {
  for (const agent of ["claude", "codex", "generic"]) {
    const target = await temp(`install-${agent}-`);
    await fs.writeFile(
      path.join(target, "AGENTS.md"),
      "User instructions remain here.",
    );
    const result = await install({ target, agent });
    const entry = path.join(result.destination, "SKILL.md");
    assert.deepEqual(
      validateFrontmatter(await fs.readFile(entry, "utf8"), "web-design"),
      [],
    );
    assert.deepEqual(checkLinks(entry, result.destination), []);
    assert.deepEqual(
      validate(path.join(result.destination, "core")).errors,
      [],
    );
    assert.equal(
      await fs.readFile(path.join(target, "AGENTS.md"), "utf8"),
      "User instructions remain here.",
    );
    const manifest = JSON.parse(
      await fs.readFile(path.join(result.destination, "manifest.json"), "utf8"),
    );
    for (const file of manifest.files) {
      const data = await fs.readFile(path.join(result.destination, file.path));
      assert.equal(
        crypto.createHash("sha256").update(data).digest("hex"),
        file.sha256,
      );
    }
    await assert.rejects(() => install({ target, agent }), /Already installed/);
    assert.equal(
      await fs.readFile(path.join(target, "AGENTS.md"), "utf8"),
      "User instructions remain here.",
    );
  }
});
test("local server serves only intended files and rejects unsafe paths", async () => {
  const dir = await temp("server-");
  await fs.writeFile(path.join(dir, "index.html"), "<h1>Local</h1>");
  await fs.writeFile(path.join(dir, ".secret"), "not served");
  const server = await serve(dir);
  try {
    assert.equal(await (await fetch(server.url)).text(), "<h1>Local</h1>");
    assert.equal((await fetch(`${server.url}/.secret`)).status, 404);
    assert.equal((await fetch(`${server.url}/%2e%2e%5cLICENSE`)).status, 404);
    assert.equal((await fetch(server.url, { method: "POST" })).status, 405);
  } finally {
    await server.close();
  }
});
test("pixel comparison detects changes, size mismatch and accidental overwrite", async () => {
  const dir = await temp("pixels-");
  const p = new PNG({ width: 4, height: 4 });
  p.data.fill(255);
  const a = path.join(dir, "a.png"),
    b = path.join(dir, "b.png"),
    d = path.join(dir, "diff.png");
  await fs.writeFile(a, PNG.sync.write(p));
  await fs.writeFile(b, PNG.sync.write(p));
  assert.equal((await compare(a, b, d)).ratio, 0);
  for (let i = 0; i < p.data.length; i += 4)
    p.data[i] = p.data[i + 1] = p.data[i + 2] = 0;
  await fs.writeFile(b, PNG.sync.write(p));
  assert.equal((await compare(a, b, d)).passed, false);
  await assert.rejects(() => compare(a, b, a), /overwrite/);
  await fs.writeFile(b, PNG.sync.write(new PNG({ width: 2, height: 2 })));
  await assert.rejects(() => compare(a, b, d), /Dimensions/);
});
test("interaction declarations require assertions and well-formed actions", () => {
  assert.throws(
    () =>
      validateFlows([
        { name: "click-only", steps: [{ action: "click", selector: "#x" }] },
      ]),
    /assertion/,
  );
  assert.throws(() => validateFlows([{ name: "../escape", steps: [] }]));
  assert.throws(
    () =>
      validateFlows([
        { name: "bad", steps: [{ action: "expectText", selector: "#x" }] },
      ]),
    /text/,
  );
  assert.doesNotThrow(() =>
    validateFlows([
      {
        name: "good",
        steps: [{ action: "expectText", selector: "#x", text: "Done" }],
      },
    ]),
  );
});
