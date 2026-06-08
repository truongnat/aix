# ai-engineering-harness for Codex

This repository uses ai-engineering-harness. This file is the Codex adapter entrypoint.

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

Follow `.ai-harness/agent-system/SYSTEM_PROMPT.md` as the repository-level operating prompt.

Follow `.ai-harness/agent-system/RESPONSE_CONTRACT.md` for blocked and evidence formats.

## Evidence standard

Accept:
- command output
- exit codes
- test results
- direct file inspection tied to the current change

Reject:
- "looks right"
- "probably passes"
- commands that were not actually run

## Forbidden

- Implementing without a clear goal and approved plan
- Shipping without verification evidence
- Writing secrets or customer data into `.harness/`
- Continuing after a blocking question
- Inventing acceptance criteria not found in artifacts

<!-- @core -->
