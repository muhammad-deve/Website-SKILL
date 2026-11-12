# Compatibility and tested boundaries

| Capability | Claude Code | Codex | Generic agent |
| --- | --- | --- | --- |
| Canonical Markdown/JSON guidance | Shared | Shared | Shared |
| Generated project skill path | `.claude/skills/web-design` | `.agents/skills/web-design` | Explicit folder |
| User-level layout | Same relative path below home | Same relative path below home | Host-specific |
| Explicit invocation | `/web-design` | `$web-design` | Read SKILL.md |
| Shell/browser tools | Host must provide them | Host must provide them | Host must provide them |
| Hooks, MCP, subagents | Not required | Not required | Not required |

Installer path layout, bundled references, hash fidelity and overwrite refusal are
covered by local automated tests. This execution does not launch a fresh Claude Code
or Codex model session to prove automatic activation or end-to-end agent behavior.
Native runtime compatibility is therefore **documentation-aligned, not fully verified**.
No claim is made for cloud-hosted skill discovery or unsupported browser environments.

Core commands use Node 22+; this execution uses Windows and Node 24. Chromium is the
initial tested browser. Firefox, WebKit, assistive technology and other operating
systems need additional runs. CI is supplied to make those runs repeatable, not as
evidence that they have already passed.
