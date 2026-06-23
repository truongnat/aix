# Security Pack

## Purpose

Route auth, secrets, trust boundaries, and policy-sensitive work toward the most relevant core skills, commands, and checks.

## When To Use

- authentication and authorization changes
- secrets handling or credential flow changes
- policy, permission, or trust-boundary work

## Recommended Core Skills

- `mapping-codebase`
- `discussing-goals`
- `writing-plans`
- `executing-plans`
- `verification`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`

## Key Checks

- deny-path behavior
- secret handling and redaction
- auth boundary coverage
- policy or permission validation

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Happy-path auth only | unauthorized access still works in a bypass path | verify the deny path directly |
| Secret leakage | logs or generated files expose credentials | inspect changed artifacts for sensitive values |
| Implicit trust | untrusted input reaches privileged logic | trace inputs to the trust boundary |
| Policy drift | behavior no longer matches the intended rules | negative tests or explicit policy checks |

## Verification Expectations

- targeted boundary tests
- deny-path coverage
- secret or log inspection when relevant

## Verification Strategy

- Start from the trust boundary and work inward.
- Verify denial behavior, not just successful access.
- Inspect logs, configs, and generated artifacts for accidental leakage.
- Capture any residual risk explicitly if a full test path is unavailable.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "The auth path works" | The deny path matters just as much; verify it directly. |
| "There are no secrets here" | Check generated files, logs, and configs rather than assuming. |
| "Policy is a later review" | If the change touches the boundary, policy is part of correctness now. |

## When Not To Use

- UI-only tasks
- docs-only changes
- generic feature work with no security boundary

## Notes

Use this pack when the repository's stack signals point to auth, secrets, or trust boundaries.
