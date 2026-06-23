# Claude Hook Adapter

Claude Code is the only provider where this harness ships a **native hook adapter example**.

## What Claude hooks can do here

- phase guard before risky commands
- record tool output after test/build commands
- record subagent result on worker completion
- compact memory on stop

## Example settings

See `settings.example.json` for a starting point. Replace `<active-session>` with the current session path from `.harness/STATE.md`.

## Rules

- Hook events are provider-specific.
- If a hook returns blocked, the agent must stop.
- Keep hook commands pointed at portable scripts in `.ai-harness/hooks/core/`.

## Related

- [../../README.md](../../README.md)
- [../../../docs/hooks-and-skills-layer.md](../../../docs/hooks-and-skills-layer.md)
