# Install and use

Requirements: Node.js 22 or newer. The router and installer use only Node built-ins.
Validation and browser tools use the pinned development dependencies.

```sh
npm ci
npm run check
npm test
node tools/design.mjs route "Build a brutalist portfolio"
node tools/design.mjs route "Build a luxury watch shop" --style luxury-editorial
node tools/design.mjs search "typography editorial" --kind styles
node tools/design.mjs tokens swiss-editorial
```

In Windows PowerShell, use `npm.cmd` if script execution blocks `npm.ps1`. In a
restricted workspace, `npm.cmd --cache .cache/npm ci` keeps npm's cache local.

## Claude Code first

From this checkout, pass the existing target project directory explicitly:

```sh
node tools/install.mjs --agent claude --target /path/to/project
```

The generated entrypoint is `.claude/skills/web-design/SKILL.md`. Start a new agent
session in that project and invoke `/web-design Build a brutalist portfolio`, or
ask for a website task and let normal skill discovery choose it. For user-level
installation, pass your home directory as the target; the resulting location is
`~/.claude/skills/web-design`. No root CLAUDE.md is overwritten.
Location and invocation follow [Claude's documentation](https://code.claude.com/docs/en/skills).

## Codex

```sh
node tools/install.mjs --agent codex --target /path/to/project
```

This writes `.agents/skills/web-design/SKILL.md`. In a new session, invoke
`$web-design Build a typography-led portfolio`. User-level installation uses the
same command with your home directory, producing `~/.agents/skills/web-design`.
Discovery paths follow [official OpenAI documentation](https://learn.chatgpt.com/docs/build-skills).
Existing AGENTS.md files are preserved. This repository's AGENTS.md governs work on
the source checkout; the installer does not impose it on the target project's root.

## Generic agents and updates

Use `--agent generic` to create `design-skills/web-design`, then have the agent read
its SKILL.md. Native discovery varies by host. The core uses Markdown, JSON, Node and
standard browser tooling; it requires no provider-specific macros or MCP server.

The installer copies a self-contained core plus a manifest of SHA-256 file hashes.
It refuses existing destinations and symlinked destination components. It does not
download packages, edit permissions, add hooks, execute skills or install globally
without an explicit target. For updates, preserve/move the old generated folder,
then install into the vacant destination. Edit the source checkout, not generated
copies. A failed write can leave a partial new folder; preserve it for diagnosis
and choose a fresh destination for a retry.

Browser tooling inside an installed bundle runs from its `core/` directory after
`npm ci` there. See [tooling](tooling.md) and [compatibility](compatibility.md).
