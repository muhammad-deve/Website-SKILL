import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import { parseDocument } from "yaml";
import { ROOT, readJSON, safePath, contrast } from "./core.mjs";

const SKIP = new Set([
  ".git",
  "node_modules",
  "artifacts",
  ".cache",
  ".claude",
  ".agents",
  ".design-intelligence",
]);
export function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      SKIP.has(e.name) || e.isSymbolicLink()
        ? []
        : e.isDirectory()
          ? walk(path.join(dir, e.name))
          : [path.join(dir, e.name)],
    );
}
export function validateFrontmatter(text, folder) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return ["Missing YAML frontmatter"];
  const doc = parseDocument(match[1], { uniqueKeys: true });
  if (doc.errors.length) return doc.errors.map((e) => e.message);
  const meta = doc.toJS();
  const errors = [];
  if (!meta || typeof meta !== "object" || Array.isArray(meta))
    return ["Frontmatter must be an object"];
  if (
    typeof meta.name !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name) ||
    meta.name.length > 64 ||
    meta.name !== folder
  )
    errors.push("Invalid or mismatched skill name");
  if (
    typeof meta.description !== "string" ||
    meta.description.trim().length < 20 ||
    meta.description.length > 1024
  )
    errors.push("Description must be a useful string of 20..1024 characters");
  for (const key of Object.keys(meta))
    if (
      !["name", "description", "license", "compatibility", "metadata"].includes(
        key,
      )
    )
      errors.push(`Nonportable frontmatter: ${key}`);
  if (text.slice(match[0].length).trim().length < 100)
    errors.push("Skill body lacks usable guidance");
  return errors;
}
function markdownBody(text) {
  return text
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .replace(/```[\s\S]*?```/g, "");
}
function anchors(text) {
  const seen = new Map();
  return new Set(
    [...markdownBody(text).matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => {
      const base = m[1]
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, "")
        .trim()
        .replace(/\s/g, "-");
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return count ? `${base}-${count}` : base;
    }),
  );
}
export function checkLinks(file, root) {
  const text = fs.readFileSync(file, "utf8");
  const errors = [];
  const links = file.endsWith(".md")
    ? [...markdownBody(text).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(
        (m) => m[1],
      )
    : [...text.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map((m) => m[1]);
  for (let link of links) {
    link = link
      .trim()
      .replace(/^<|>$/g, "")
      .split(/\s+["']/)[0];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/i.test(link)) continue;
    try {
      const [raw, fragment] = link.split("#");
      const decoded = decodeURIComponent(raw.split("?")[0]);
      const dest = decoded
        ? safePath(
            root,
            path.relative(root, path.resolve(path.dirname(file), decoded)),
          )
        : file;
      if (!fs.existsSync(dest)) errors.push(`Missing link: ${link}`);
      else if (
        fragment &&
        dest.endsWith(".md") &&
        !anchors(fs.readFileSync(dest, "utf8")).has(
          decodeURIComponent(fragment),
        )
      )
        errors.push(`Missing anchor: ${link}`);
      else if (
        fragment &&
        dest.endsWith(".html") &&
        !new RegExp(
          `id=["']${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        ).test(fs.readFileSync(dest, "utf8"))
      )
        errors.push(`Missing HTML anchor: ${link}`);
    } catch (e) {
      errors.push(`Invalid link ${link}: ${e.message}`);
    }
  }
  return errors;
}
export function validate(root = ROOT) {
  const errors = [];
  const files = walk(root);
  const error = (file, msg) =>
    errors.push(`${path.relative(root, file)}: ${msg}`);
  for (const file of files) {
    if (file.endsWith(".json"))
      try {
        readJSON(file);
      } catch (e) {
        error(file, e.message);
      }
    if (path.basename(file) === "SKILL.md")
      for (const e of validateFrontmatter(
        fs.readFileSync(file, "utf8"),
        path.basename(path.dirname(file)),
      ))
        error(file, e);
    if (/\.(md|html)$/.test(file) && path.basename(file) !== "promopt.md")
      for (const e of checkLinks(file, root)) error(file, e);
  }
  const load = (relative) => {
    try {
      return readJSON(path.join(root, relative));
    } catch (e) {
      errors.push(`${relative}: ${e.message}`);
      return null;
    }
  };
  const sources = load("research/sources.json");
  const catalog = load("references/catalog.json");
  const provenance = load("research/provenance.json");
  const taxonomy = load("knowledge/taxonomy.json");
  const rubric = load("evals/rubric.json");
  const schema = load("schemas/style.schema.json");
  function unique(items, label) {
    const seen = new Set();
    for (const item of items || []) {
      if (!item.id || seen.has(item.id))
        errors.push(`${label}: missing or duplicate id ${item.id}`);
      seen.add(item.id);
    }
    return seen;
  }
  const sourceIds = unique(sources?.sources, "sources");
  const refIds = unique(catalog?.entries, "references");
  for (const s of sources?.sources || []) {
    if (
      !/^https:\/\//.test(s.url) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(s.inspected) ||
      !s.scope ||
      !s.evidence ||
      !s.license
    )
      errors.push(`Source ${s.id}: incomplete evidence metadata`);
    if (s.revision && !/^[a-f0-9]{40}$/.test(s.revision))
      errors.push(`Source ${s.id}: invalid revision`);
  }
  for (const entry of catalog?.entries || []) {
    for (const key of [
      "name",
      "url",
      "industry",
      "inspected",
      "evidence",
      "scope",
      "typography",
      "layout",
      "color",
      "motion",
      "use_when",
      "implementation",
    ])
      if (typeof entry[key] !== "string" || !entry[key].trim())
        errors.push(`Reference ${entry.id}: missing ${key}`);
    for (const key of [
      "styles",
      "patterns",
      "observations",
      "strengths",
      "weaknesses",
      "sources",
      "limitations",
    ])
      if (!Array.isArray(entry[key]) || !entry[key].length)
        errors.push(`Reference ${entry.id}: missing ${key}`);
    for (const id of entry.sources || [])
      if (!sourceIds.has(id))
        errors.push(`Reference ${entry.id}: unknown source ${id}`);
    for (const award of entry.awards || [])
      if (
        !award.organization ||
        !award.designation ||
        !award.year ||
        !award.source?.startsWith("https://")
      )
        errors.push(`Reference ${entry.id}: invalid award evidence`);
  }
  const styleFiles = files.filter(
    (f) =>
      path.dirname(f) === path.join(root, "knowledge/styles") &&
      f.endsWith(".json"),
  );
  const styleIds = new Set();
  const ajv = new Ajv({ allErrors: true });
  const check = schema ? ajv.compile(schema) : null;
  for (const file of styleFiles) {
    let p;
    try {
      p = readJSON(file);
    } catch {
      continue;
    }
    if (check && !check(p)) error(file, ajv.errorsText(check.errors));
    if (p.id !== path.basename(file, ".json") || styleIds.has(p.id))
      error(file, "Style ID mismatch or duplicate");
    styleIds.add(p.id);
    for (const id of p.sources || [])
      if (!sourceIds.has(id)) error(file, `Unknown source ${id}`);
    for (const id of p.references || [])
      if (!refIds.has(id)) error(file, `Unknown reference ${id}`);
    try {
      for (const [a, b] of [
        ["text", "background"],
        ["muted", "background"],
        ["text", "surface"],
        ["on_accent", "accent"],
      ])
        if (contrast(p.tokens[a], p.tokens[b]) < 4.5)
          error(file, `Default normal-text token pair below 4.5: ${a}/${b}`);
    } catch (e) {
      error(file, e.message);
    }
  }
  for (const id of taxonomy?.implemented || [])
    if (!styleIds.has(id))
      errors.push(`Taxonomy: missing implemented style ${id}`);
  for (const id of styleIds)
    if (!taxonomy?.implemented?.includes(id))
      errors.push(`Taxonomy: unregistered style ${id}`);
  if (rubric?.dimensions?.length !== 12)
    errors.push("Rubric must cover all 12 agreed dimensions");
  unique(rubric?.dimensions, "rubric");
  for (const item of provenance?.incorporated || []) {
    for (const key of [
      "path",
      "source_id",
      "upstream_url",
      "revision",
      "license",
      "notice_path",
      "modifications",
      "verified",
    ])
      if (!item[key]) errors.push(`Provenance: missing ${key}`);
    if (!sourceIds.has(item.source_id))
      errors.push("Provenance: unknown source");
    for (const p of [item.path, item.notice_path].filter(Boolean))
      try {
        if (!fs.existsSync(safePath(root, p)))
          errors.push(`Provenance: missing ${p}`);
      } catch (e) {
        errors.push(e.message);
      }
  }
  return {
    errors,
    files: files.length,
    skills: files.filter((f) => path.basename(f) === "SKILL.md").length,
    styles: styleIds.size,
    references: refIds.size,
    sources: sourceIds.size,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const result = validate();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.errors.length ? 1 : 0;
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
