#!/usr/bin/env node
import {
  route,
  search,
  profiles,
  contrast,
  tokenCSS,
  parseArgs,
} from "./core.mjs";

try {
  const [command, ...args] = process.argv.slice(2);
  const { flags, positional } = parseArgs(args, {
    style: "value",
    kind: "value",
    limit: "value",
  });
  let result;
  if (command === "route")
    result = route(positional.join(" "), { style: flags.style });
  else if (command === "search") {
    const limit = Number(flags.limit ?? 5);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20)
      throw new Error("--limit must be an integer from 1 to 20");
    if (flags.kind && !["all", "styles", "references"].includes(flags.kind))
      throw new Error("Invalid --kind");
    result = search(positional.join(" "), { limit, kind: flags.kind });
  } else if (command === "tokens") {
    const p = profiles().find((p) => p.id === positional[0]);
    if (!p) throw new Error("Use tokens <implemented-style-id>");
    console.log(tokenCSS(p));
    result = {
      scope: "Opaque sRGB token pairs only; not a rendered contrast audit",
      pairs: [
        ["text", "background"],
        ["muted", "background"],
        ["text", "surface"],
        ["on_accent", "accent"],
      ].map(([a, b]) => ({
        foreground: a,
        background: b,
        ratio: contrast(p.tokens[a], p.tokens[b]),
        normal_text_aa: contrast(p.tokens[a], p.tokens[b]) >= 4.5,
      })),
    };
  } else
    throw new Error(
      'Commands: route "brief" [--style id], search "query" [--kind styles|references] [--limit 5], tokens <id>',
    );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
