# ai-engineering-harness generic agent instructions

This repository uses ai-engineering-harness.

Core harness rules are provider-neutral. This file is the generic fallback entrypoint.

Use canonical command IDs:

- harness-plan
- harness-run
- harness-verify
- harness-ship

Do not assume provider-native slash commands.

Read `.ai-harness/activation.md` and route commands through `.ai-harness/runtime-commands/`.

Fallback instruction: **Use harness-plan for this repository.**

<!-- @core -->
