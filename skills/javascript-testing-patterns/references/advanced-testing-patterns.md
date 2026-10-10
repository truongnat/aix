# Advanced JavaScript Testing Patterns

Use this reference when the task needs examples beyond the compact workflow.

## Integration tests

Use a real boundary where it proves behavior: HTTP handlers, persistence adapters, queues, and serialization. Keep setup deterministic and isolate external services behind test fixtures or disposable environments.

## React and component tests

Test user-observable behavior with Testing Library. Prefer accessible queries, explicit state transitions, and minimal mocking of browser or network boundaries.

## Snapshots, timers, and promises

Use snapshots only for stable, reviewable structures. Restore fake timers and mocks after each test. Assert rejected promises explicitly and keep timeout behavior deterministic.

## Verification packet examples

| Case | Claim and criteria | Evidence required | Status rule |
|---|---|---|---|
| Deterministic suite | User-observable behavior, explicit failure assertion, deterministic fixture, and clean teardown | Fresh test output, fixture description, coverage map, and teardown result | `pass` when target and failure paths are covered |
| Mock/timer leak | Tests isolate state and restore timers/mocks after each case | Repeated run or failure trace showing leakage | `block`; a green rerun does not erase leakage |
| External boundary unavailable | Integration behavior is verified against a real/disposable boundary | Unit/component output plus environment status | `defer` until the named integration owner supplies fresh evidence |

For final handoff, include `Claim`, `Criteria`, `Evidence`, `Coverage map`, `Limitations`, `Decision`, and `Next owner`; `sk-verify-pro` decides whether the claim is proven.
