# remembering

## Purpose

Capture durable lessons, constraints, and decisions that will improve later sessions.

## When To Use

- chained automatically after `harness-ship` when status is `shipped`
- after shipping meaningful work (standalone when ship was ship-only)
- after resolving a root cause or tricky tradeoff
- when new constraints should shape future decisions

## When Not To Use

- for transient status that will be obsolete soon
- for noisy details that do not help future work
- when the lesson cannot be written safely without exposing sensitive data

## Inputs

- verification and ship artifacts
- prior memory notes if present
- the durable lesson, decision, or hazard to preserve

## Workflow

1. Review the goal, plan, verification, and outcome.
2. Identify the durable fact, decision, root cause, or hazard worth keeping.
3. Exclude temporary details, secrets, and private business data.
4. Write concise memory tied to affected areas.
5. If the work produced an approved delta spec, record that the durable spec layer should absorb it when enabled.
6. Confirm the note would help a future session start faster.

## Operating Principles

- Memory should reduce rediscovery.
- Durable decisions beat narrative history.
- Short, precise memory loads faster.
- Record constraints that are easy to forget but costly to miss.

## Reasoning Procedure

1. Restate the durable lesson and why it matters later.
2. Check that the lesson is stable, reusable, and safe to store.
3. Convert it into a short memory entry with references.
4. Stop and report blocked if the lesson would capture sensitive data.

## Action Loop

- Thought: identify the durable decision or hazard worth keeping.
- Action: inspect the evidence and draft the memory entry.
- Observation: verify the entry is factual, scoped, and sanitized.
- Repeat until the lesson is ready to record.

## Examples

### Example 1

Input: Repeated validation failures showed a missing heading requirement.

Output:
- Remember note: add the heading to the validator before relying on the doc surface.
- Durable decision: required docs must be enforced by bin/validate.js.
- Affected-area references: lib/validate/constants.ts, lib/validate/hooks-skills.ts.

### Example 2

Input: Recording the lesson would require secrets or private data.

Output:
- Blocked: unsafe to store in memory.
- Needed next step: summarize the pattern without sensitive details.
## Output Contract

This skill must produce:

- a remember note
- durable decisions or hazards
- affected-area references

## Common Failure Modes

- saving transient execution chatter
- storing secrets or sensitive business details
- writing a lesson before verifying whether it is durable

## Checklist Before Done

- [ ] The memory is durable
- [ ] Transient noise was removed
- [ ] The affected area is clear
- [ ] The note helps future work
- [ ] No secrets or private business data are stored
