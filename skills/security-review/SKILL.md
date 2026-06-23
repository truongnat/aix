---
id: security-review
name: Security Review
status: active
scope: core
version: 1
can_block: true
can_write: false
inputs:
  - changed files or diff
  - relevant data flow or surface
  - existing verification evidence
outputs:
  - findings list
  - residual risk statement
  - next command recommendation
tools:
  - read-only inspection
  - dependency audit command
---

# security-review

## Purpose

Identify security risks in a change before it ships, with emphasis on auth,
input validation, secrets handling, and dependency risk.

## When To Use

- when a change touches auth, session handling, or access control
- when user input reaches persistence, commands, or external systems
- when secrets or credentials are involved
- when dependency versions change
- before shipping any security-sensitive code path

## When Not To Use

- when no inspectable change exists yet
- when the task is only early-stage goal clarification
- when the change is outside any plausible security boundary

## Inputs

- the change surface and affected data flow
- verification evidence if already available
- dependency or environment changes relevant to the diff

## Workflow

1. Identify the affected trust boundaries.
2. Check input validation and command construction.
3. Check auth and access control.
4. Check secrets handling and logging.
5. Check dependency risk with the appropriate audit command.
6. Record findings with severity and concrete evidence.

## Operating Principles

- Security review is evidence-based, not intuition-based.
- The changed boundary matters more than the surrounding code style.
- Missing verification is a security finding when it weakens ship readiness.

## Reasoning Procedure

1. Restate the security boundary and the claim to be checked.
2. Check the evidence, data flow, and relevant dependencies.
3. Derive the smallest concrete risk assessment from the artifacts.
4. Stop and report blocked if the surface cannot be inspected safely.

## Action Loop

- Thought: identify the next boundary, dependency, or input to inspect.
- Action: read the diff, trace the flow, or run the relevant audit check.
- Observation: record the actual security-relevant result.
- Repeat until the risk posture is clear.

## Examples

### Example 1

Input: The change only edits prompt content and validator contracts.

Output:
- Findings: no auth or secrets boundary touched.
- Residual risk: low, with a note that the new eval is deterministic.
- Next command: run the validator and tests.

### Example 2

Input: The changed surface cannot be inspected or is outside the safe boundary.

Output:
- Blocked: missing inspectable diff or unclear trust boundary.
- Needed next step: inspect the relevant files before approving.
## Output Contract

This skill must produce:

- findings list with severity
- explicit no-findings result when appropriate
- residual risk statement
- next command recommendation when the work is blocked or needs follow-up

## Common Failure Modes

- reviewing style instead of risk
- missing input validation at the system boundary
- approving a change without checking secrets exposure
- skipping dependency checks on version-sensitive changes

## Verification Requirements

- every claimed security concern is tied to concrete evidence
- any missing audit or missing verification is stated explicitly
- no-findings still includes what was checked and the residual risk

## Checklist Before Done

- [ ] The affected trust boundaries were identified
- [ ] Input validation and auth were checked where relevant
- [ ] Secrets handling was inspected
- [ ] Dependency risk was reviewed when applicable
- [ ] Findings or no-findings were written clearly
