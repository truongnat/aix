# Runtime Install Payloads

Files here are installed by the primary Node.js CLI (`npx ai-engineering-harness install`) through `dist/lib/install-runtime.js` into **provider-specific entrypoints**. `install.sh` can still bootstrap the same runtime-native path remotely. These payloads do **not** copy the full capability pack into the product repo root.

## Three-layer model (project scope)

```txt
<runtime entrypoint>  →  adapter (this directory)
.ai-harness/          →  capability source (dist/lib/install-cache.js)
.harness/             →  project state (created when missing for project installs)
```

Every project runtime-native install should run **cache + optional harness init + runtime payload**. Entrypoints only tell the agent where to read; without `.ai-harness/` there is no local capability-pack source for `commands/`, `skills/`, or `workflows/`, even if the runtime has native project commands.

| Layer | Examples |
|---|---|
| Entrypoint | `.cursor/commands/harness-*.md`, `.cursor/rules/ai-engineering-harness.mdc`, `.claude/CLAUDE.md`, `AGENTS.md`, `.gemini/extensions/.../GEMINI.md` |
| Capability | `.ai-harness/AGENTS.md`, `commands/`, `skills/`, `workflows/`, … |
| State | `.harness/HARNESS.md`, goals, memory |

## Payload map

| Path | Runtime |
|---|---|
| `bootstrap/` | Codex, generic → project `AGENTS.md` |
| `cursor/rules/` | Cursor |
| `claude/` | Claude Code project/global |
| `gemini/` | Gemini CLI extension |

See [docs/private-capability-cache.md](../docs/private-capability-cache.md) and [docs/runtime-install-matrix-research.md](../docs/runtime-install-matrix-research.md).
