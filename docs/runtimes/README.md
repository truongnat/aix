# Runtime Guides

These guides explain how to consume the plugin-like markdown capability pack inside specific agent runtimes without adding adapters, plugins, or runtime code.

## Start Here

- [Frozen Runtime Consumption Contract](../frozen-runtime-consumption-contract.md)
- [Runtime Comparison Guide](comparison.md)
- [Runtime Consumption Model](../runtime-consumption-model.md)
- [Plugin Model](../plugin-model.md)
- [Consume As Pack](../consume-as-pack.md)

Start with the comparison guide if you are unsure which runtime guide to use.

## Included Guides

- [Session Start Checklist](../session-start-checklist.md)
- [Claude Code](claude-code.md) - updated for capability-pack consumption
- [Cursor](cursor.md) - updated for capability-pack consumption
- [Codex](codex.md) - updated for capability-pack consumption
- [Gemini CLI](gemini-cli.md) - updated for capability-pack consumption
- [OpenCode](opencode.md) - updated for capability-pack consumption

## Shared Model

Across runtimes:

- keep `AGENTS.md` in the target repository root
- keep active project artifacts in the target repository `.harness/`
- treat `commands/` as the operating loop
- treat `skills/` as reusable behavior references
- keep markdown as the source of truth

## Safety Reminder

Do not store secrets, tokens, customer data, or private business data in harness artifacts.
