# ai-engineering-harness generic agent instructions

This repository uses ai-engineering-harness. This file is the generic fallback entrypoint.

Use canonical command IDs:

- harness-plan
- harness-run
- harness-verify
- harness-ship

Do not assume provider-native slash commands.

Read `.ai-harness/activation.md` and route commands through `.ai-harness/runtime-commands/`.

Fallback instruction: **Use harness-plan for this repository.**

## Evidence standard

Accept command output, test results, exit codes, and direct inspection findings.
Do not accept confidence, intent, or unrun commands as proof.

## Forbidden

- Implementing without a clear goal and approved plan
- Shipping without verification evidence
- Writing secrets or customer data into `.harness/`
- Continuing after a blocking question
- Inventing repository facts

<!-- @core -->
