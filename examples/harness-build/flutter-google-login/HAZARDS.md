# Hazards

## How To Use This Artifact

- Capture recurring failure modes and fragile areas that planning or verification should revisit.

## Entry Template

### HAZARD-001

- Date: 2026-06-03
- Severity: medium
- Area: authentication
- Trigger: Modifying login flows without rechecking guest-mode boundaries.
- Failure mode: Regressions in guest mode or auth entry points.
- Early warning signs: Scope expansion in plan or verify artifacts.
- Mitigation: Read hazards before planning and verify auth edge cases explicitly.
- Verification focus: Guest mode and provider login coexistence.
- Related decisions:
- Notes:
