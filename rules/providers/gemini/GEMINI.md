# ai-engineering-harness for Gemini

This project uses ai-engineering-harness. This file is the Gemini adapter entrypoint.

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

## Verification standard

Verification is complete only when command output, test results, exit codes, or explicit manual check results are recorded in the active verification artifact.

Confidence is not evidence.

## Forbidden

- Implementing before the plan is approved
- Shipping when verification is missing or blocked
- Writing secrets, tokens, customer data, or private business data into `.harness/`
- Continuing after a blocking question without an answer
- Claiming commands were run when they were only suggested

<!-- @core -->
