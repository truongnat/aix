# Runtime Install Payloads

Files in this directory are installed by `install-runtime.js` (invoked from `install.sh`) into runtime-native locations. They do **not** copy the full capability pack into the product repo root.

| Path | Runtime |
|---|---|
| `bootstrap/` | Codex, generic, shared AGENTS.md snippets |
| `cursor/rules/` | Cursor project/global rules |
| `opencode/plugins/` | OpenCode local plugin |
| `gemini/` | Gemini CLI extension manifest |
| `claude/` | Claude Code project/global hints |

See [docs/runtime-install-matrix-research.md](../docs/runtime-install-matrix-research.md).
