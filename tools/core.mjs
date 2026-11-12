import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const readJSON = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
export function profiles(root = ROOT) {
  return fs
    .readdirSync(path.join(root, "knowledge/styles"))
    .filter((n) => n.endsWith(".json"))
    .sort()
    .map((n) => readJSON(path.join(root, "knowledge/styles", n)));
}
const STOP_WORDS = new Set(
  "a an the and or but for from with without in on of at to is be this that it as my our your new build create make website websites site page interface redesign audit improve please".split(
    " ",
  ),
);
export const words = (text) =>
  [...new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])].filter(
    (word) => !STOP_WORDS.has(word),
  );

export function search(query, { root = ROOT, limit = 5, kind = "all" } = {}) {
  if (!query.trim()) return [];
  const docs = [];
  if (kind === "all" || kind === "styles")
    for (const p of profiles(root)) {
      docs.push({
        id: p.id,
        kind: "style",
        name: p.name,
        path: `knowledge/styles/${p.id}.json`,
        keywords: [p.name, ...p.aliases, ...Object.values(p.axes).flat()].join(
          " ",
        ),
        detail: [p.philosophy, ...p.use_cases].join(" "),
        sources: p.sources,
        evidence: "original-recipe",
        scope: p.evidence,
      });
    }
  if (kind === "all" || kind === "references")
    for (const p of readJSON(path.join(root, "references/catalog.json"))
      .entries) {
      docs.push({
        id: p.id,
        kind: "reference",
        name: p.name,
        path: "references/catalog.json",
        keywords: [p.name, p.industry, ...p.styles, ...p.patterns].join(" "),
        detail: p.observations.join(" "),
        sources: p.sources,
        evidence: p.evidence,
        scope: p.scope,
      });
    }
  const terms = words(query);
  return docs
    .map((d) => {
      const primary = new Set(words(d.keywords));
      const secondary = new Set(words(d.detail));
      const matched = terms.filter((t) => primary.has(t) || secondary.has(t));
      const score = terms.reduce(
        (s, t) => s + (primary.has(t) ? 4 : secondary.has(t) ? 1 : 0),
        0,
      );
      return {
        id: d.id,
        name: d.name,
        kind: d.kind,
        path: d.path,
        score,
        matched,
        sources: d.sources,
        evidence: d.evidence,
        scope: d.scope,
      };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function route(brief, { root = ROOT, style } = {}) {
  if (!brief.trim()) throw new Error("A nonempty brief is required.");
  const all = profiles(root);
  if (style && !all.some((p) => p.id === style))
    throw new Error(`Unknown style: ${style}`);
  const hits = search(brief, { root, kind: "styles", limit: 2 });
  const selected = style
    ? [all.find((p) => p.id === style)]
    : hits.map((h) => all.find((p) => p.id === h.id));
  const normalizedBrief = ` ${words(brief).join(" ")} `;
  const implementedTerms = new Set(all.flatMap(p => [p.id, p.name, ...p.aliases]).map(term => words(term).join(" ")));
  const coverageNotes = readJSON(path.join(root, "knowledge/taxonomy.json")).coverage_backlog
    .filter(term => term.axis !== "product" && normalizedBrief.includes(` ${words(term.name).join(" ")} `) && !implementedTerms.has(words(term.name).join(" ")))
    .map(term => `No dedicated profile for ${term.name}. Candidates may match other brief terms; research this aesthetic before applying them.`);
  const intent = /\b(redesign|restyle|rebuild)\b/i.test(brief)
    ? "redesign"
    : /\b(audit|critique|review)\b/i.test(brief)
      ? "audit"
      : "build";
  const skills = [
    "design-orchestrator",
    intent === "audit" ? "visual-audit" : "creative-direction",
  ];
  if (intent === "redesign") skills.push("redesign");
  if (/\b(motion|animate|animation)\b/i.test(brief))
    skills.push("motion-design");
  if (/\b(accessibility|accessible|wcag|keyboard)\b/i.test(brief))
    skills.push("accessibility");
  return {
    version: 1,
    brief,
    intent,
    confidence: style ? "explicit" : hits.length ? "lexical-match" : "no-match",
    warning:
      "Lexical retrieval is a reading aid, not an aesthetic decision. Review negations, competing styles and brand constraints before applying it.",
    skills: [...new Set(skills)].map((n) => `skills/${n}/SKILL.md`),
    styles: selected.map((p) => ({
      id: p.id,
      path: `knowledge/styles/${p.id}.json`,
      axes: p.axes,
    })),
    references: search(brief, { root, kind: "references", limit: 2 }),
    read_next: [
      "knowledge/foundations/design-decisions.md",
      "templates/design-brief.md",
      "evals/rubric.json",
    ],
    gaps: [...coverageNotes, ...(selected.length ? [] : [
      "No implemented style match. State a provisional direction or research the requested aesthetic; do not invent a catalog entry.",
    ])],
    evidence_required: [
      "Rendered desktop and mobile review",
      "Primary task exercised",
      "Automated results and manual critique reported separately",
    ],
  };
}

export function luminance(hex) {
  if (!/^#[a-f\d]{6}$/i.test(hex))
    throw new Error(`Expected opaque #RRGGBB color, got ${hex}`);
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
export function contrast(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function tokenCSS(profile) {
  return (
    ":root {\n" +
    Object.entries(profile.tokens)
      .map(([k, v]) => `  --${k.replaceAll("_", "-")}: ${v};`)
      .join("\n") +
    "\n}\n"
  );
}
export function parseArgs(args, allowed) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }
    const key = a.slice(2);
    if (!(key in allowed)) throw new Error(`Unknown option: ${a}`);
    if (key in flags) throw new Error(`Repeated option: ${a}`);
    if (allowed[key] === "boolean") flags[key] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith("--"))
        throw new Error(`Missing value for ${a}`);
      flags[key] = args[++i];
    }
  }
  return { flags, positional };
}
export function safePath(root, relative) {
  const resolved = path.resolve(root, relative);
  const rel = path.relative(root, resolved);
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel))
    throw new Error(`Path escapes root: ${relative}`);
  return resolved;
}
