import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { ROOT, parseArgs, safePath } from "./core.mjs";

const CONTENT = [
  "skills",
  "knowledge",
  "references",
  "research",
  "templates",
  "evals",
  "tools",
  "schemas",
  "examples",
  "tests",
  "docs",
  "package.json",
  "package-lock.json",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "NOTICE",
  "promopt.md",
];
export async function install({ target, agent, source = ROOT }) {
  if (!["claude", "codex", "generic"].includes(agent))
    throw new Error("Agent must be claude, codex or generic");
  const root = await fs.realpath(target);
  const relative =
    agent === "claude"
      ? ".claude/skills/web-design"
      : agent === "codex"
        ? ".agents/skills/web-design"
        : "design-skills/web-design";
  const dest = safePath(root, relative);
  let current = root;
  for (const segment of relative.split("/")) {
    current = path.join(current, segment);
    try {
      if ((await fs.lstat(current)).isSymbolicLink())
        throw new Error(`Refusing symlink destination: ${current}`);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  try {
    await fs.access(dest);
    throw new Error(
      `Already installed: ${dest}. Preserve or move it before installing a new version.`,
    );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const payload = [];
  async function collect(file, relative) {
    const stat = await fs.lstat(file);
    if (stat.isSymbolicLink())
      throw new Error(`Symlink in source bundle: ${relative}`);
    if (stat.isDirectory())
      for (const name of (await fs.readdir(file)).sort())
        await collect(path.join(file, name), `${relative}/${name}`);
    else payload.push({ relative, data: await fs.readFile(file) });
  }
  // Complete source reads before writing destination; no network and no hooks.
  for (const name of CONTENT) await collect(path.join(source, name), name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.mkdir(dest); // exclusive; never overwrite an existing installation
  for (const { relative, data } of payload) {
    const output = safePath(path.join(dest, "core"), relative);
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, data, { flag: "wx" });
  }
  const entry = `---\nname: web-design\ndescription: "Design, implement and visually refine websites using relevant style guidance and browser evidence."\n---\n\n# Web design\n\nRead [the canonical orchestrator](core/skills/design-orchestrator/SKILL.md), then only the guidance relevant to the task. The core root is this skill directory's core/ folder. Honor the user's product, stack and scope. No hooks, remote services or automatic delegation are required.\n`;
  await fs.writeFile(path.join(dest, "SKILL.md"), entry, { flag: "wx" });
  const manifest = {
    version: 1,
    agent,
    installed_at: new Date().toISOString(),
    files: payload.map((p) => ({
      path: `core/${p.relative}`,
      sha256: crypto.createHash("sha256").update(p.data).digest("hex"),
    })),
  };
  await fs.writeFile(
    path.join(dest, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  return {
    destination: dest,
    files: payload.length + 2,
    note: "Generated copy. Edit canonical source and reinstall into a fresh destination to update.",
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const { flags, positional } = parseArgs(process.argv.slice(2), {
      agent: "value",
      target: "value",
    });
    if (positional.length || !flags.agent || !flags.target)
      throw new Error(
        "Usage: node tools/install.mjs --agent claude|codex|generic --target existing-directory",
      );
    console.log(JSON.stringify(await install(flags), null, 2));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
