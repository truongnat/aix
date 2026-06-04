# ai-engineering-harness for Claude Code

This repository uses ai-engineering-harness.

Core harness rules are provider-neutral. This file is the Claude adapter entrypoint.

## Read Order

1. `.ai-harness/activation.md`
2. `.harness/STATE.md`
3. Active session under `.harness/sessions/`
4. Matching command contract under `.ai-harness/commands/`
5. Matching prompt template under `.ai-harness/prompt-templates/`

## Command Rule

Use canonical command IDs:

- harness-plan
- harness-run
- harness-verify
- harness-ship

Claude project slash commands may expose these as:

- `/harness-plan`
- `/harness-run`
- `/harness-verify`
- `/harness-ship`

Claude is the only provider where this install claims project-native `/harness-*` command files under `.claude/commands/`.

## Subagents

For gated review, verification, or ship gates, prefer delegated workers under `.claude/agents/`:

- harness-reviewer
- harness-verifier
- harness-gatekeeper
- harness-fixer (bounded remediation only)

Worker results must include the shared `Agent Result` envelope.

## ai-engineering-harness System Prompt

Read and follow:

- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`
- `.ai-harness/agent-system/TONE_AND_FORMAT.md`

These instructions define the senior engineering behavior, phase discipline, blocked output, and response quality expected in this repository.

<!-- @core -->
