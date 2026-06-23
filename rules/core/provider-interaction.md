## Provider Interaction Tools

Markdown-only option lists are **fallback**, not the primary path.

Before deliberative discuss or three-option scoring:

1. Read `.ai-harness/provider-interaction.md` (install-generated for this repo's provider).
2. If a **Structured user choice tool** is listed, **invoke that tool** after the scoring table.
3. Continue `harness-discuss` after the tool returns the user's answer.
4. Use chat fallback only when the tool is absent from the active tool list.

| Provider | Structured choice tool |
|----------|------------------------|
| Cursor | `AskQuestion` |
| Claude Code | `AskUserQuestion` |
| Codex | chat fallback (no verified tool in v1) |
| Gemini | chat fallback (no verified tool in v1) |

Do not end the turn with an unscored markdown menu when the provider tool is available.
