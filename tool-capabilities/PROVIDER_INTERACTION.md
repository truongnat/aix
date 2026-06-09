# Provider Interaction Tools

Harness deliberative discuss and three-option scoring must use **provider-native tools** when installed — not markdown-only choice lists.

## Discover

```bash
node scripts/discover-provider-tools.js
node scripts/discover-provider-tools.js --target . --json
```

After install, read `.ai-harness/provider-interaction.md` in the target repository.

## Provider matrix

| Provider | Structured choice tool | Fallback |
|----------|------------------------|----------|
| Cursor | `AskQuestion` | numbered chat options |
| Claude Code | `AskUserQuestion` | numbered chat options |
| Codex | none (v1) | reply A/B/C in chat |
| Gemini | none (v1) | reply A/B/C in chat |

Source: `lib/provider-interaction-tools.ts`, `rules/core/provider-interaction.md`.
