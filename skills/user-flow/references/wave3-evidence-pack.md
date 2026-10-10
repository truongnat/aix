# User-flow recovery states

This Wave 3 fixture is synthetic and illustrative. It records a bounded claim; it does not execute connectors, tests, deployments, exploit activity, or release approval.

## Positive or selected case

A synthetic login/checkout flow covers entry, action, success, recovery, error and exit states.

## Negative, edge, or blocked case

An unreachable branch is explicit and handed to wireframe/story-spec owners rather than rendered as a screen.

## Evidence packet

- **Claim:** one bounded domain/artifact claim only.
- **Acceptance evidence:** entry, actions, branches, success, recovery, error, exit, handoff.
- **Limitations:** assumptions, unsupported features, stale inputs, unverified environments, and residual risk are listed explicitly.
- **Next owner:** sk-user-flow -> sk-ux-wireframe/sk-story-spec.
- **Final decision:** `sk-verify-pro` owns `pass`, `block`, or `defer`; this fixture never makes that decision.
