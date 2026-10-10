# Detail-design contract and error path

This Wave 3 fixture is synthetic and illustrative. It records a bounded claim; it does not execute connectors, tests, deployments, exploit activity, or release approval.

## Positive or selected case

A valid model/state/API contract records field constraints, transitions and validation.

## Negative, edge, or blocked case

Missing or blocked BASIC_DESIGN.md stops detailed design and routes upstream.

## Evidence packet

- **Claim:** one bounded domain/artifact claim only.
- **Acceptance evidence:** fields, constraints, states, validation, errors, upstream dependency, handoff.
- **Limitations:** assumptions, unsupported features, stale inputs, unverified environments, and residual risk are listed explicitly.
- **Next owner:** sk-basic-design -> sk-detail-design -> sk-planning.
- **Final decision:** `sk-verify-pro` owns `pass`, `block`, or `defer`; this fixture never makes that decision.
