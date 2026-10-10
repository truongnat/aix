# High-end visual design QA fixture

This Wave 3 fixture is synthetic and illustrative. It records a bounded claim; it does not execute connectors, tests, deployments, exploit activity, or release approval.

## Positive or selected case

before.png and after.png at desktop/mobile breakpoints are supplied by the visual review owner; the audit checks composition and motion guardrails.

## Negative, edge, or blocked case

Missing screenshots, layout shift, performance violation or inaccessible interaction is a visual QA limitation, not a prose pass.

## Evidence packet

- **Claim:** one bounded domain/artifact claim only.
- **Acceptance evidence:** screenshot paths, breakpoint matrix, performance notes, accessibility handoff, limitations.
- **Limitations:** assumptions, unsupported features, stale inputs, unverified environments, and residual risk are listed explicitly.
- **Next owner:** sk-frontend-design-pro -> sk-accessibility-compliance -> sk-verify-pro.
- **Final decision:** `sk-verify-pro` owns `pass`, `block`, or `defer`; this fixture never makes that decision.

## Visual fixture contract

Supply real review inputs under the task artifact directory before marking covered:

- `before.png` and `after.png` for desktop and mobile breakpoints;
- a breakpoint/viewport manifest;
- a visual diff or annotated review, with no customer data;
- performance and accessibility handoff notes.

Text in this file is a contract for visual evidence, not a substitute for screenshots or visual regression output.
