# Minimalist UI QA fixture

This Wave 3 fixture is synthetic and illustrative. It records a bounded claim; it does not execute connectors, tests, deployments, exploit activity, or release approval.

## Positive or selected case

Screenshot fixtures validate hierarchy, banned elements, responsive states and interaction polish.

## Negative, edge, or blocked case

Missing state coverage or interaction regression is recorded as unverified; prose cannot replace visual evidence.

## Evidence packet

- **Claim:** one bounded domain/artifact claim only.
- **Acceptance evidence:** screenshot paths, hierarchy, banned-element scan, responsive states, interaction notes.
- **Limitations:** assumptions, unsupported features, stale inputs, unverified environments, and residual risk are listed explicitly.
- **Next owner:** sk-ux-design-pro -> sk-accessibility-compliance -> sk-verify-pro.
- **Final decision:** `sk-verify-pro` owns `pass`, `block`, or `defer`; this fixture never makes that decision.

## Visual fixture contract

Supply real review inputs under the task artifact directory before marking covered:

- `before.png` and `after.png` for desktop and mobile breakpoints;
- a breakpoint/viewport manifest;
- a visual diff or annotated review, with no customer data;
- performance and accessibility handoff notes.

Text in this file is a contract for visual evidence, not a substitute for screenshots or visual regression output.
