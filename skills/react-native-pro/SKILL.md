---
name: react-native-pro
description: |
  Production-grade React Native and Expo: screens, navigation, lists, animations, native modules, EAS builds, Hermes, New Architecture — plus system model (JS thread vs native UI, Hermes, bridge/JSI/Fabric, list virtualization), failure modes (list keys, nav/back/deep link races, keyboard softInputMode, OTA vs native builds, insecure storage), decision trade-offs (Expo managed vs prebuild vs bare, FlatList vs FlashList, animations), and quality guardrails (SDK-accurate APIs, Release-on-device checks, a11y minimum).

  Use this skill when the user works on React Native, Expo, mobile screens, navigation, lists, animations, native modules, EAS builds, Hermes, New Architecture, or asks for RN code review, styling, accessibility, keyboard handling, Safe Area, Android back behavior, deep linking, images, or FlatList/FlashList performance.

  Combine with **`react-pro`** for shared React patterns, **`testing-pro`** for Detox/Maestro, **`security-pro`** for tokens and deep links, **`deployment-pro`** for store release, **`design-system-pro`** / **`mobile-design-pro`** for design tokens and mobile UX, **`performance-tuning-pro`** when latency is dominated outside the app, and **`typescript-pro`** for strict typing.

  Triggers: "React Native", "Expo", "RN", "FlatList", "FlashList", "SafeArea", "keyboard avoiding", "Android back", "Hermes", "Reanimated", "Expo Router", "EAS", "touch target", "a11y", "accessibility", "StatusBar", "notch", "pixel ratio", "deep link", "New Architecture", "performance", "re-render", "memo".

metadata:
  short-description: RN/Expo — threading model, UI/UX, perf, failure modes, guardrails
  content-language: en
  domain: mobile-framework
  level: professional
---

# React Native (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [React Native](https://reactnative.dev/) and [Expo](https://docs.expo.dev/) docs for API truth; this skill encodes **platform-correct defaults**, **threading-aware performance**, and **mobile UX/accessibility** — not a copy of the docs. Confirm **Expo vs bare / prebuild**, **Expo SDK + RN major**, and **target OS versions** from the repo when available.

## Boundary

**`react-native-pro`** owns **React Native and Expo application** concerns: UI, navigation, lists, RN-specific APIs, EAS workflow hints, and mobile platform edge cases. **`react-pro`** owns **generic React** (hooks, patterns) without RN APIs. **`deployment-pro`** owns **store policy, CI release trains, and infra outside the app**. **`security-pro`** owns **threat modeling and crypto policy** beyond “use secure storage.”

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`react-pro`** | Hooks, composition, state patterns portable from web |
| **`mobile-design-pro`** | Touch targets, motion, platform HIG alignment |
| **`testing-pro`** | Detox, Maestro, unit/component test setup |
| **`security-pro`** | Keychain, attestation, deep link validation |
| **`deployment-pro`** | EAS Submit, phased rollout, store metadata |
| **`design-system-pro`** | Design tokens applied in RN |
| **`performance-tuning-pro`** | Backend/API/CDN dominates latency |
| **`typescript-pro`** | Typed routes and strict components |

## When to use

- Building or refactoring screens, navigation, lists, forms, modals, animations.
- RN/Expo code review for performance, accessibility, or iOS vs Android correctness.
- Debugging keyboard, safe areas, linking, Hermes, New Arch, or EAS build issues.
- Aligning UI with spacing, typography, loading/error/empty states, touch targets.

## When not to use

- **Pure web React** (Next, DOM) — **`react-pro`** / **`nextjs-pro`**.
- **Native-only** Swift/Kotlin feature without RN bridge context — Apple/Google docs + minimal RN handoff.
- **Backend API design** as primary topic — **`api-design-pro`** / **`nestjs-pro`** (pair for mobile client).

## Required inputs

- **Expo vs bare** (or prebuild) when suggesting native or config-plugin changes.
- **`package.json`** versions (`expo`, `react-native`, key animation/nav libs) when recommending version-sensitive APIs.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** workflow (managed/prebuild/bare), SDK/RN versions, and platforms in scope. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm Expo workflow, SDK/RN versions, and platforms before proposing RN changes. Ask whether the issue reproduces on iOS, Android, or both.
2. **Simplicity First** — Start with the smallest screen/component/layout fix that satisfies the mobile requirement. Avoid adding libraries, native modules, or config plugins unless required.
3. **Surgical Changes** — Touch only the screen, navigator, style, or platform-specific file directly involved. Do not refactor unrelated UI surfaces.
4. **Goal-Driven Execution** — Done = the behavior is verified on the target device/emulator path, not just inferred from code.
5. **Platform truth over symmetry** — iOS and Android differences are real product constraints; do not force identical behavior when platform conventions differ.
6. **Threading-aware choices** — JS-thread work, list rendering, gestures, and animation ownership should be explicit before optimizing.
7. **Accessibility is part of the contract** — Focus order, labels, touch targets, and dynamic text support are not optional polish.
8. **OTA vs native boundary** — If a fix requires native capabilities or config changes, state clearly whether OTA updates can deliver it.

## Default recommendations by scenario

- **Layout or density issue** — Fix the current screen composition and touch ergonomics before adding new UI containers.
- **Navigation bug** — Confirm deep links, back behavior, and route ownership before changing screen state.
- **Performance issue** — Check list identity, render frequency, and image/animation costs before adding memoization or alternative libraries.
- **Build/release issue** — Separate JavaScript changes from native/EAS configuration changes first.

## Decision trees

Summary: decide first whether the problem is screen/layout, navigation/lifecycle, runtime performance, or native workflow, then choose the smallest platform-correct fix.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: forcing web patterns onto native UI, index keys in lists, hiding platform bugs behind conditionals, and treating OTA updates as if they can ship native binary changes.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### React Native runtime and threading model (summary)

How JS, native UI, Hermes, and list rendering interact so performance and lifecycle issues are diagnosed correctly.

Details: [references/react-native-runtime-and-threading-system-model.md](references/react-native-runtime-and-threading-system-model.md)

### Failure modes and mitigation (summary)

Keyboard overlap, safe-area mistakes, back/deep-link races, list instability, and build workflow drift.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

When to stay managed, when to prebuild or go bare, and how to choose list/animation/navigation strategies.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### UI/UX design integration (summary)

Mobile ergonomics, spacing, motion, and accessibility constraints that shape implementation choices.

Details: [references/ui-ux-design.md](references/ui-ux-design.md)

### Versions (summary)

SDK and RN version notes that affect architecture, supported APIs, and release constraints.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Workflow, SDK/RN versions, platforms, and screen/navigation surface involved.
2. **System model** — Explain the relevant lifecycle, threading, or platform behavior.
3. **Solution** — Minimum code or config change with platform-specific intent.
4. **Verification** — Device/emulator path and checks to confirm the fix.
5. **Residual risks** — Platform differences, build constraints, accessibility gaps, or release caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| React Native runtime and threading model | [references/react-native-runtime-and-threading-system-model.md](references/react-native-runtime-and-threading-system-model.md) |
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

**Input:** "The keyboard covers my submit button on Android."
- Check screen container, `softInputMode`, and scroll/focus strategy before adding arbitrary padding.
- Fix the affected screen boundary instead of introducing global layout hacks.
- **Verify:** On Android, the focused field and submit CTA remain visible through the full form flow.

**Input (tricky):** "An OTA update didn't fix a crash after adding a native capability."
- Clarify whether the change touched native config, permissions, or modules; OTA cannot ship those binary changes.
- Split the JavaScript fix from the native release requirement and state the rollout path explicitly.
- **Verify:** A new binary build contains the native change; OTA-only installs do not claim unsupported behavior.

**Input (cross-skill):** "A long feed stutters and drops gestures."
- Pair **`react-pro`** for render patterns and use **`react-native-pro`** to reason about list virtualization, JS thread work, and gesture ownership.
- Stabilize item identity and render cost before replacing the whole list stack.
- **Verify:** Scrolling and gestures remain smooth on target devices with representative data volume.

## Checklist before calling the skill done

- [ ] Workflow, SDK/RN versions, and target platforms confirmed before proposing changes (Think Before Coding)
- [ ] Minimum screen/component/config change chosen; no unnecessary library or native expansion (Simplicity First)
- [ ] Only the affected screen, navigator, or platform file was changed (Surgical Changes)
- [ ] Success criteria and on-device verification path are explicit and validated (Goal-Driven Execution)
- [ ] Platform-specific behavior is acknowledged instead of forced into false symmetry
- [ ] Accessibility basics remain intact: labels, focus, touch targets, dynamic text
- [ ] Performance claims are tied to real list/render/thread behavior where relevant
- [ ] OTA vs native release boundary is stated clearly when config/native code is involved
