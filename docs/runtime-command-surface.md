# Runtime Command Surface

See also: [provider-command-matrix.md](provider-command-matrix.md), [provider-native-command-research.md](provider-native-command-research.md).

## Two layers

```txt
1. Provider-native packaging (npm package root)
   .cursor-plugin/plugin.json
   .claude-plugin/plugin.json
   .codex-plugin/plugin.json
   gemini-extension.json
   commands/  skills/  hooks/

2. Project-local activation (npx install)
   .ai-harness/runtime-commands/   ← local command catalog (always)
   .harness/
   provider entrypoints + native paths where supported
```

## Local catalog (canonical names)

`harness:plan`, `harness:verify`, … — **not** a claim that `/harness:plan` exists in every UI.

## Command behavior (provider-independent)

How a command runs after routing is defined in `.ai-harness/commands/` — same for every provider. Example: **`harness:discuss`** must synthesize `.harness/REVIEW.md` when present, not ask redundant mode questions. See [harness-command-behavior.md](harness-command-behavior.md).

## Provider matrix (summary)

| Provider | Mode | Native slash | Project install adds |
|----------|------|--------------|----------------------|
| Claude Code | native-plugin | `/harness-plan` (file); plugin namespace TBD | `.claude/commands/harness-*.md` |
| Cursor | plugin-ready | via plugin when published | `.cursor/rules/` (fallback) |
| Gemini | fallback-only | none | extension `GEMINI.md` + manifest |
| Codex | plugin-packaging | plugin skills via `/plugins` | `AGENTS.md` fallback |
| Generic | fallback-only | none | `AGENTS.md` aliases |

## Install methods

| Provider | Preferred | Fallback |
|----------|-----------|----------|
| Cursor | `/add-plugin ai-engineering-harness` | npx + rules → `.ai-harness/` |
| Claude | `/plugin install …` | npx + `.claude/commands/` |
| Gemini | `gemini extensions install <url>` | ask harness:plan |

## Troubleshooting

| Symptom | Action |
|---------|--------|
| `/harness:plan` missing | Expected on most providers — use `/harness-plan` (Claude project file) or ask **harness:plan** |
| Cursor slash empty | Install plugin when published; use rules fallback |
| Doctor WARN plugin-ready | Informational |
