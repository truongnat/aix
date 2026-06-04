# ai-engineering-harness for Codex

This repository uses ai-engineering-harness.

Core harness rules are provider-neutral. This file is the Codex adapter entrypoint.

## Activation

When the user asks for a harness command such as harness-plan:

1. Read `.ai-harness/activation.md`
2. Read `.harness/STATE.md`
3. Read the active session under `.harness/sessions/`
4. Read `.ai-harness/runtime-commands/harness-plan.md` (or matching command)
5. Read `.ai-harness/commands/harness-plan.md`
6. Follow the matching prompt template if present

## Codex Command Support

Do **not** assume native `/harness-*` slash commands.

Use the local command catalog and AGENTS.md instructions.

Fallback instruction: **Use harness-plan for this repository.**

<!-- @core -->
