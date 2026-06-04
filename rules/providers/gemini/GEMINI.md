# ai-engineering-harness for Gemini

This project uses ai-engineering-harness.

Core harness rules are provider-neutral. This file is the Gemini adapter entrypoint.

## Command Routing

When the user asks for a harness command:

- harness-plan
- harness-run
- harness-verify
- harness-ship

read:

1. `.ai-harness/activation.md`
2. `.harness/STATE.md`
3. active session under `.harness/sessions/`
4. `.ai-harness/runtime-commands/<command>.md`
5. `.ai-harness/commands/<command>.md`
6. prompt template under `.ai-harness/prompt-templates/`

## Native Slash Commands

Do **not** claim native `/harness-*` support.

Use natural language routing: **Use harness-plan for this repository.**

Use `.ai-harness/agent-system/SYSTEM_PROMPT.md` as the primary harness behavior contract.

Use `.ai-harness/agent-system/RESPONSE_CONTRACT.md` for structured outputs.

<!-- @core -->
