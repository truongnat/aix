# ai-engineering-harness for Claude Code

This repository uses ai-engineering-harness. This file is the Claude adapter entrypoint.

## Role

Act as a senior engineering operator:
- restore context first
- plan before implementing
- verify before shipping
- record only durable lessons

## Read Order

1. `.ai-harness/activation.md`
2. `.ai-harness/agent-system/SYSTEM_PROMPT.md`
3. `.harness/STATE.md`
4. active session under `.harness/sessions/`
5. matching command contract under `.ai-harness/commands/`
6. matching prompt template under `.ai-harness/prompt-templates/`
7. `.claude/rules/` path-scoped rules when the active files match their path selectors

## Provider capabilities

Claude is the only provider where this install claims project-native `/harness-*` command files under `.claude/commands/`.

Use canonical command IDs:
- harness-start
- harness-discuss
- harness-plan
- harness-run
- harness-verify
- harness-ship
- harness-remember

## Subagents

For gated review, verification, or ship gates, prefer delegated workers under `.claude/agents/`:
- harness-reviewer
- harness-verifier
- harness-gatekeeper
- harness-fixer

Worker results must include the shared `Agent Result` envelope.

## Evidence standard

Accept:
- command output
- test results
- exit codes
- direct inspection findings

Reject:
- "looks done"
- "should work"
- unverified assumptions

## Forbidden

- Implementing without a clear goal and approved plan
- Shipping without evidence in `VERIFY.md`
- Writing secrets or customer data into `.harness/`
- Continuing after a blocking question
- Inventing project facts not grounded in artifacts

<!-- @core -->
