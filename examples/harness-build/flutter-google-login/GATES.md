# Quality Gates Profile

> Do not include credentials, tokens, customer data, or private business data.

## Purpose

Define the project-specific quality gates for the Google login feature.

## Current Status

- Status: approved example
- Last updated: 2026-06-02
- Owner: demo harness build

## Quality Gates

- Strictness level: high for auth and state-handling paths
- Evidence expectation: targeted automated checks plus explicit manual simulator or device flow checks

## Evidence Requirements

- Phase: Plan
- Entry criteria: goal and scope are clear, guest mode is protected explicitly
- Required evidence: ordered tasks, scope boundaries, verification strategy

- Phase: Run
- Entry criteria: approved plan, selected team pattern, selected skills
- Required evidence: changed areas mapped to tasks, no unplanned scope expansion

- Phase: Verify
- Entry criteria: implementation for the scoped feature is complete
- Required evidence: guest flow still works, Google login works, logout works, token or session behavior checked, simulator or device manual checks recorded

- Phase: Ship
- Entry criteria: verification evidence is documented
- Required evidence: summary of what changed, not-run items, remaining risks

## Stop Conditions

- Phase: Plan
- Stop conditions: implementation begins before plan approval or acceptance criteria are vague

- Phase: Run
- Stop conditions: auth redesign emerges without approval

- Phase: Verify
- Stop conditions: any critical flow remains unverified or broken

- Phase: Ship
- Stop conditions: risk summary is missing or not-run items are hidden

## Assumptions

- [ ] Manual flow checks are acceptable if they are recorded explicitly.

## Unknowns

- [ ] Whether platform-specific sign-in behavior requires separate iOS and Android evidence in all cases

## Human Review

- Status: approved example
- Notes: Guest flow protection is a non-negotiable gate for this scenario.
