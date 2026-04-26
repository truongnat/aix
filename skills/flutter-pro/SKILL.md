---
name: flutter-pro
description: |
  Production-grade Flutter development: widgets (Element/RenderObject pipeline), Material 3 / UX, performance and frame budgets, multi-platform edge cases (web, desktop, channels), Dart patterns — plus framework/render pipeline model, failure modes (async gaps, overflow, jank, plugin skew, golden flake, CORS), decision trade-offs (platform scope, state routing, add-to-app), quality guardrails (SDK-accurate APIs, no fabricated pub versions).

  Use this skill when the user works on Flutter, Dart, widgets, Material / Cupertino, theming, navigation (go_router, Navigator 2), state management (Provider, Riverpod, Bloc, GetIt), animations, platform channels, web, desktop (Windows/macOS/Linux), iOS/Android builds, Impeller/Skia, accessibility, or asks for Flutter code review, layout, lists, isolates, or compile-size concerns.

  Combine with **`testing-pro`**, **`deployment-pro`**, **`security-pro`**, **`design-system-pro`**, **`sql-data-access-pro`**, **`ci-cd-pro`**, **`mobile-design-pro`** as needed.

  Triggers: "Flutter", "Dart", "Widget", "StatelessWidget", "StatefulWidget", "State", "setState", "build method", "const widget", "Key", "ValueKey", "GlobalKey", "InheritedWidget", "Theme.of", "Material 3", "Cupertino", "go_router", "Navigator", "Riverpod", "Provider", "Bloc", "BuildContext", "mounted", "async gap", "Sliver", "ListView", "CustomScrollView", "RepaintBoundary", "Impeller", "Skia", "platform channel", "MethodChannel", "FFI", "web", "Flutter desktop", "semantics", "a11y", "Golden test", "integration_test".

metadata:
  short-description: Flutter — render pipeline model, widgets, UI/UX, failure modes, multi-platform
  content-language: en
  domain: flutter
  level: professional
---

# Flutter (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Flutter](https://docs.flutter.dev/) and [Dart](https://dart.dev/) docs for API truth; this skill encodes **widget discipline**, **render/frame awareness**, **UI/UX defaults**, and **cross-platform pitfalls** — not generic Dart tutorials.

## Boundary

**`flutter-pro`** owns **Flutter/Dart UI**, **widgets**, **routing/state patterns**, **platform guards**, and **performance hygiene**. **`deployment-pro`** owns **release pipelines** beyond build flavors/signing handoff; **`security-pro`** owns **auth/threat** depth; **`mobile-design-pro`** owns **native platform UX conventions** at HIG depth when not purely Flutter layout.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`testing-pro`** | Goldens, integration_test CI, flaky policy |
| **`deployment-pro`** | Store/web ship, flavors, signing orchestration |
| **`security-pro`** | Tokens, secure storage, threat-relevant code |
| **`design-system-pro`** | Design tokens → `ThemeData` mapping |
| **`sql-data-access-pro`** | Drift/sqflite schema and queries |
| **`ci-cd-pro`** | `flutter test`/`build` in pipelines, cache |
| **`mobile-design-pro`** | Touch targets, safe area, platform UX nuance |

## When to use

- Screens, navigation, theming, forms, lists, animations.
- Code review: widget structure, state boundaries, performance.
- iOS vs Android vs web vs desktop differences; async/`BuildContext`; plugins.
- Material 3, accessibility, responsive layouts.
- Refactoring trees: keys, lifecycle, `const`, pure `build`.

## When not to use

- **Backend-only** API design — **`nestjs-pro`** / **`api-design-pro`**.
- **Raw native Swift/Kotlin** without Flutter bridge — native docs + platform channels pointer only.

## Required inputs

- **Flutter/Dart SDK** constraint (or “latest stable”) when suggesting APIs (`mounted`, etc.).
- **Target platforms** (mobile/web/desktop) for guards and testing advice.

## Expected output

Follow **Suggested response format** strictly — pipeline awareness through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** SDK/channel and target platforms; verify breaking APIs in docs for that major. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm Flutter/Dart SDK, target platforms, and UI/runtime surface before proposing changes. Ask when the issue is platform-specific or plugin-dependent.
2. **Simplicity First** — Prefer the smallest widget, state, or layout fix that solves the problem. Do not add packages, patterns, or platform abstractions without need.
3. **Surgical Changes** — Touch only the relevant widget tree, route, state boundary, or platform integration point. Avoid opportunistic refactors across the app.
4. **Goal-Driven Execution** — Done = the behavior is correct on target platforms and the render/state assumptions are verified.
5. **Widget purity matters** — `build` should stay cheap and side-effect free; async and mutable work should not leak across lifecycle boundaries.
6. **Platform differences are real** — Web, mobile, and desktop can fail for different reasons even with the same Dart code.
7. **Frame budget is a contract** — UI correctness includes avoiding unnecessary jank, rebuild churn, and layout thrash.
8. **Plugin and SDK drift matter** — Platform channel and package behavior must match the actual SDK/plugin versions in use.

## Default recommendations by scenario

- **Layout issue** — Fix constraints, composition, and widget structure before swapping libraries.
- **State issue** — Check lifecycle and state boundary correctness before introducing new state tools.
- **Performance issue** — Inspect rebuild scope and rendering cost before adding caching or isolates.
- **Cross-platform issue** — Reproduce per platform and separate Flutter-core behavior from plugin/platform integration.

## Decision trees

Summary: choose the fix based on whether the issue is widget structure, state lifecycle, render cost, or platform/plugin boundary.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: side effects in `build`, overuse of `GlobalKey`, plugin sprawl, and treating all platform failures as pure Flutter layout bugs.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Flutter framework and render pipeline model (summary)

How widgets, elements, render objects, and frame scheduling interact so UI bugs stay structurally explainable.

Details: [references/flutter-framework-and-render-pipeline-model.md](references/flutter-framework-and-render-pipeline-model.md)

### Widgets and composition (summary)

How to structure widget trees, state boundaries, and compositional patterns for maintainable Flutter code.

Details: [references/widgets.md](references/widgets.md)

### UI/UX design integration (summary)

How Flutter implementation choices should respect usable spacing, hierarchy, and cross-platform interaction constraints.

Details: [references/ui-ux-design.md](references/ui-ux-design.md)

### Failure modes and mitigation (summary)

Async gaps, overflow, jank, plugin skew, golden flake, and platform-specific runtime failures to catch early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect SDK APIs, rendering engines, package compatibility, and platform support.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Flutter/Dart version, target platforms, package/runtime context, and UI surface involved.
2. **Framework model** — Explain the relevant widget, lifecycle, render, or platform behavior.
3. **Solution** — Minimum widget/state/platform change with rationale.
4. **Verification** — Device/platform checks that prove the fix.
5. **Residual risks** — Remaining plugin, performance, or cross-platform caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Flutter framework and render pipeline model | [references/flutter-framework-and-render-pipeline-model.md](references/flutter-framework-and-render-pipeline-model.md) |
| Widgets and composition | [references/widgets.md](references/widgets.md) |
| UI/UX design integration | [references/ui-ux-design.md](references/ui-ux-design.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "This Flutter screen overflows on smaller phones."
- Fix constraints and widget composition before changing state architecture.
- Keep the solution scoped to the affected layout surface.
- **Verify:** The screen renders without overflow on the target device classes.

**Input (tricky):** "A plugin works on Android but fails on web."
- Separate Flutter widget logic from plugin/platform support boundaries.
- Confirm version and platform constraints before editing unrelated UI code.
- **Verify:** The failure reproduces only on the unsupported boundary or is fixed with the correct platform-specific path.

**Input (cross-skill):** "Map our design tokens into Flutter themes."
- Pair **`design-system-pro`** for token intent and keep **`flutter-pro`** focused on `ThemeData` and widget implementation.
- Avoid inventing token semantics inside code.
- **Verify:** Theme mapping is consistent and the widgets consume it predictably across screens.

## Checklist before calling the skill done

- [ ] Flutter/Dart version, target platforms, and runtime context confirmed first (Think Before Coding)
- [ ] Minimum widget/state/platform change chosen; no unnecessary package or architecture expansion (Simplicity First)
- [ ] Only the affected widget tree or integration boundary was changed (Surgical Changes)
- [ ] Success criteria and platform verification path are explicit (Goal-Driven Execution)
- [ ] `build` purity and lifecycle correctness are preserved
- [ ] Performance implications are considered where relevant
- [ ] Platform/plugin drift is acknowledged where relevant
- [ ] Residual cross-platform or package risks are documented
