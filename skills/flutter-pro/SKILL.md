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