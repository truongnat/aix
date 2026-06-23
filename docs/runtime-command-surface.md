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

2. Project-local activation (npx ai-engineering-harness install)
   .ai-harness/runtime-commands/   ← local command catalog (always)
   .harness/
   provider entrypoints + native paths where supported
```

## Local catalog (canonical names)

`harness-plan`, `harness-verify`, … — **not** a claim that `/harness-plan` exists in every UI.

Workflow catalog only:

- `harness-map`
- `harness-start`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-ship`
- `harness-remember`

Product CLI diagnostics stay separate:

- `status`
- `doctor`

## Command behavior (provider-independent)

How a command runs after routing is defined in `.ai-harness/commands/` — same for every provider. Example: **`harness-discuss`** must synthesize `.harness/REVIEW.md` when present, not ask redundant mode questions. See [harness-command-behavior.md](harness-command-behavior.md).

## Provider matrix (summary)

| Provider | Mode | Native slash | Project install adds |
|----------|------|--------------|----------------------|
| Claude Code | native-plugin | `/harness-plan` via project command files where installed | `.claude/commands/harness-*.md`, `.claude/agents/harness-*.md`, `.claude/skills/` |
| Cursor | native-command-files | `/harness-plan` via project command files | `.cursor/commands/`, `.cursor/rules/` |
| Codex | plugin-packaging | plugin skills via `/plugins` | `AGENTS.md`, `.codex/`, `.agents/skills/` |
| Gemini | native-command-files | none | `.gemini/extensions/ai-engineering-harness/` (`GEMINI.md` + manifest) |
| Generic | fallback-only | none | `AGENTS.md` aliases |

## Install methods

| Provider | Preferred | Fallback |
|----------|-----------|----------|
| Cursor | `npx ai-engineering-harness install` + project commands/rules | `/add-plugin ai-engineering-harness` when published |
| Claude | `/plugin install …` | `npx ai-engineering-harness install` + `.claude/commands/`, `.claude/agents/`, `.claude/skills/` |
| Codex | `/plugins` (when marketplace published) | `npx ai-engineering-harness install` + `.codex/`, `.agents/skills/`, `AGENTS.md` |
| Gemini | `gemini extensions install <url>` | ask harness-plan via `GEMINI.md` context |

## Troubleshooting

| Symptom | Action |
|---------|--------|
| `/harness-plan` missing | Expected on most providers — use `/harness-plan` where project commands are installed or ask **harness-plan** |
| Cursor slash empty | Install project commands/rules; plugin publish remains optional |
| Doctor WARN plugin-ready | Informational |
