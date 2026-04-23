# Decision tree — testing-pro

## Which layer?

```
Pure function / domain rule?
└── Unit test — fast, many cases

Touches DB / HTTP / queue / filesystem?
├── Integration test — real dependency or Testcontainers
└── Still tempted to mock everything? → reconsider; mock only boundaries

Critical user journey / cross-browser?
└── E2E — minimal count; stable selectors
```

## Contract vs full browser e2e

```
Service boundary stable (OpenAPI / Pact)?
└── Contract or consumer-driven tests — fewer moving parts than full UI

Need full UX + browser engine behavior?
└── E2E — keep count small; pair with integration for API regressions
```

## RTL: query priority

```
Prefer accessible queries:
├── getByRole (name)
├── getByLabelText
├── getByPlaceholderText
└── getByTestId — last resort for stability
```

## Flake appears only in CI

```
Passes locally, fails in CI?
├── Timing → remove sleeps; synchronize on UI/network
├── Data → isolate fixtures; unique ids
├── Env → Node version, TZ, parallel workers
└── Quarantine + ticket; do not infinite-retry blindly
```
