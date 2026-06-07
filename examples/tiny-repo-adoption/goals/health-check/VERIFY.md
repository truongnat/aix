# Verification

## Goal

Add a health check endpoint without changing existing behavior.

## Status

status: pending
summary: validation should be run in the adopted target repo before claiming completion.

## Tests Run

| Command | Exit Code | Result | Notes |
|---|---:|---|---|
| `node bin/validate.js --target ../my-project --profile-only` | not run | pending | Run after profile artifacts are created |
| `node bin/validate.js --target ../my-project --goal health-check` | not run | pending | Run after goal artifacts are created |

## Manual Checks

| Step | Expected | Observed | Result |
|---|---|---|---|
| Review artifact set | Artifacts are understandable and structurally complete | Not run in example | pending |

## Deferred Human Checks

| Check | Why automation is insufficient | Owner | Blocking for ship? | Status |
|---|---|---|---|---|
| Inspect adapted artifacts in the real host repo | This example cannot see the target repo where the artifacts will be used | adopting maintainer | yes | pending |

## Evidence

- Commands executed: record validation commands during real use
- Files inspected: profile and goal artifacts in the target repo
- Link, log, or snippet: attach validation output during real verification

## Known Gaps

- Application runtime checks are not included in this example (by design).

## Ship Blockers

- A real target repo must run the listed validation commands before any completion or ship claim.
