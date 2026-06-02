# Runtime Guides

These guides explain how to consume the plugin-like markdown capability pack inside specific agent runtimes without adding adapters, plugins, or runtime code.

## Start Here

- [Runtime Consumption Model](../runtime-consumption-model.md)
- [Plugin Model](../plugin-model.md)
- [Consume As Pack](../consume-as-pack.md)

## Included Guides

- [Session Start Checklist](../session-start-checklist.md)
- [Claude Code](claude-code.md) - updated for capability-pack consumption
- [Cursor](cursor.md) - updated for capability-pack consumption
- [Codex](codex.md)
- [Gemini CLI](gemini-cli.md)
- [OpenCode](opencode.md)

## Shared Model

Across runtimes:

- keep `AGENTS.md` in the target repository root
- keep active project artifacts in the target repository `.harness/`
- treat `commands/` as the operating loop
- treat `skills/` as reusable behavior references
- keep markdown as the source of truth

## Safety Reminder

Do not store secrets, tokens, customer data, or private business data in harness artifacts.
