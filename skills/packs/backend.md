# Backend Pack

## Purpose

Route API, service, and persistence work toward the most relevant core skills, commands, and checks.

## When To Use

- APIs, services, business logic, persistence
- auth boundaries and request handling
- data consistency or contract-sensitive changes

## Recommended Core Skills

- `mapping-codebase`
- `writing-plans`
- `executing-plans`
- `verification`
- `code-review`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`

## Key Checks

- contract compatibility
- input validation
- error handling
- idempotency where relevant
- data consistency and boundary safety

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| N+1 query | latency spikes under realistic load | query logs, explain plan, or integration timing |
| Missing migration | works locally, fails in staging or CI | run migration status on a clean database |
| Auth boundary leak | protected action works without correct auth | route or middleware map plus integration test |
| Race condition | passes single-user tests, flakes under concurrency | concurrent integration test or explicit locking audit |
| Silent data loss | job exits 0 but record is not persisted | explicit persistence assertion or DLQ inspection |
| Unvalidated input | internal happy path passes, real payloads break | boundary validation test with malformed inputs |

## Verification Expectations

- targeted tests
- integration checks when the host repo supports them
- migration or persistence safety review if relevant

## Verification Strategy

- Run unit tests for business logic changes, not only the happy path.
- Run an integration test for persistence, auth, queue, or webhook changes.
- Test migrations on a clean database when schema or seed data changes.
- Check idempotency for handlers that may be retried.
- Record boundary validation evidence when inputs can come from untrusted callers.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "The migration is tiny, no need to test on a clean DB" | Migration order and prior state matter; test on a clean DB or the check is incomplete. |
| "Auth is tested elsewhere" | Verify the changed boundary directly; auth regressions usually hide in untested paths. |
| "This endpoint is read-only, race conditions do not matter" | Reads can still race with writes; check whether stale reads are safe for this behavior. |
| "The handler returned 200 so persistence is fine" | Success response is not persistence evidence; assert the durable side effect. |

## When Not To Use

- UI-only work
- purely mobile presentation work
- documentation-only changes

## Notes

If persistence or auth changes are risky, make rollback and verification explicit in the plan.
