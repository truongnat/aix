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

1. Confirm SDK/channel and target platforms; verify breaking APIs in docs for that major.
2. Apply summaries; open `references/` for depth.
3. Respond with **Suggested response format**; cite **failure modes** when perf, plugins, or ship risk.

### Operating principles

1. **Platform awareness** — `kIsWeb`, `defaultTargetPlatform`, desktop embedders — **`edge-cases.md`**.
2. **Immutable widgets + narrow rebuilds** — Keys, granular listenables — **`widgets.md`**.
3. **Async safety** — `mounted` / `context.mounted` before UI updates after `await`.
4. **Pin versions** — Flutter majors and plugins — **`versions.md`**.
5. **Accessibility** — Semantics, contrast, focus — **`ui-ux-design.md`**.
6. **Testability** — Inject deps; widget vs integration split — **`integration-map.md`**.
7. **Responsive breakpoints** — `LayoutBuilder` / `MediaQuery` — **`ui-ux-design.md`**.
8. **Plugins** — Read changelogs (Firebase, camera, maps) — **`failure-modes-detection-mitigation.md`**.

### Flutter framework and render pipeline (summary)

Widgets / elements / render objects; frame phases; embedders — **`flutter-framework-and-render-pipeline-model.md`**.

Details: [references/flutter-framework-and-render-pipeline-model.md](references/flutter-framework-and-render-pipeline-model.md)

### Failure modes — detection and mitigation (summary)

Dispose races, overflow, jank, leaks, plugin skew, goldens, CORS — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Platform scope, state pattern, routing, add-to-app — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

SDK-correct snippets; no fake package versions — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### UI / UX (summary)

Material 3, layout, touch targets, safe areas — **`ui-ux-design.md`**.

Details: [references/ui-ux-design.md](references/ui-ux-design.md)

### Widget craft (summary)

Pure `build`, lifecycle, keys, `BuildContext` — **`widgets.md`**.

Details: [references/widgets.md](references/widgets.md)

### Tips and tricks (summary)

Lists, rebuild scope, images, isolates, tests — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Async gaps, web, desktop, channels, IME, RTL, frames — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Anti-patterns (summary)

God widgets, unbounded lists — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Decision trees (summary)

State, go_router, lists, web, add-to-app — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Integration map (summary)

**`testing-pro`**, **`deployment-pro`**, **`security-pro`**, **`design-system-pro`**, **`ci-cd-pro`**, … — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

SDK and package matrix — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Flutter/Dart constraint, target platforms, performance vs ship pressure.
2. **Problem / goal** — Bug, feature, review ask, architecture choice.
3. **System design** — Where in widget/rebuild pipeline the issue sits; state ownership — **`flutter-framework-and-render-pipeline-model.md`**.
4. **Decision reasoning** — Routing/state/platform scope — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Minimal Dart snippets; API shapes valid for stated SDK — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Rebuild cost, platform branches, plugin weight.
7. **Failure modes** — Relevant risks (dispose, overflow, jank, web) — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Untested platforms; follow-up tests; **`testing-pro`** / **`deployment-pro`** handoff.

## Resources in this skill

| Topic | File |
|-------|------|
| **Framework & render pipeline** | [references/flutter-framework-and-render-pipeline-model.md](references/flutter-framework-and-render-pipeline-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| **Widget craft** | [references/widgets.md](references/widgets.md) |
| UI/UX design | [references/ui-ux-design.md](references/ui-ux-design.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** `setState()` after dispose on async return.  
**Expected output:** Full **Suggested response format** — `mounted`/`context.mounted`, cancellation, **failure mode** dispose race.

### 2 — Tricky (edge case)

**Input:** `RenderFlex overflowed` on small devices, release only.  
**Expected output:** Flex/text scale/scroll; a11y large text — **`edge-cases.md`**; frame/layout — **`flutter-framework-and-render-pipeline-model.md`**.

### 3 — Cross-skill

**Input:** Offline-first sync + local DB.  
**Expected output:** **`flutter-pro`** UI + Drift/sqflite — **`sql-data-access-pro`** schema — **`security-pro`** tokens — **`integration-map.md`**.

## Checklist before calling the skill done

### Correctness & lifecycle

- [ ] **`mounted`** / **`context.mounted`** after `await`; listeners disposed — **`widgets.md`**.
- [ ] No **unbounded** list in unbounded height without scroll fix — **`anti-patterns.md`**.

### UX & platform

- [ ] Accessibility and theme/text scale — **`ui-ux-design.md`**.
- [ ] Platform guards documented (`kIsWeb`, `Platform`, …) — **`edge-cases.md`**.

### Performance & risk

- [ ] Lists/images/rebuild scope considered — **`tips-and-tricks.md`**.
- [ ] **Failure modes** named when perf, plugins, or web ship — **`failure-modes-detection-mitigation.md`**.
- [ ] [decision-tree.md](references/decision-tree.md) when navigation or global state scope is non-trivial.
