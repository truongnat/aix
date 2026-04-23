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

1. Confirm workflow (managed/prebuild/bare), SDK/RN versions, and platforms in scope.
2. Apply summaries below; open `references/`; use **`react-native-runtime-and-threading-system-model.md`** when explaining jank or bridge costs.
3. Respond with **Suggested response format**; include **failure modes** for lists, nav, OTA, and security-adjacent flows.

### Operating principles

1. **Platform first** — iOS vs Android differences; no web CSS semantics — **`edge-cases.md`**.
2. **Measure before optimizing** — Profiler / Reanimated metrics; list tuning — **`tips-and-tricks.md`**.
3. **Explicit boundaries** — Effects with cleanup; typed navigation — **`anti-patterns.md`**.
4. **Verify versions in-repo** — Before new APIs — **`quality-validation-and-guardrails.md`**.
5. **Accessibility by default** — Labels, roles, contrast — **`ui-ux-design.md`**.
6. **Navigation state explicit** — Typed params; deep link readiness — **`failure-modes-detection-mitigation.md`**.
7. **Images and assets** — Density-aware; avoid huge decode on JS thread — **`react-native-runtime-and-threading-system-model.md`**.
8. **EAS / native builds** — OTA cannot replace native changes — **`decision-tree.md`**.

### UI / UX (summary)

Spacing rhythm, dynamic type, safe area, states, touch targets — **`ui-ux-design.md`**.

Details: [references/ui-ux-design.md](references/ui-ux-design.md)

### Runtime and threading model (summary)

JS vs UI threads, Hermes, JSI/Fabric/New Arch, list virtualization — **`react-native-runtime-and-threading-system-model.md`**.

Details: [references/react-native-runtime-and-threading-system-model.md](references/react-native-runtime-and-threading-system-model.md)

### Tips and tricks (summary)

FlatList/FlashList, images, navigation, Hermes compatibility — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Keyboard, Android back, dimensions, deep links, Fast Refresh, builds, OTA — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Expo tiers, FlashList adoption, WebView vs browser, animation trade-offs — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Index keys, SafeArea skips, fat `renderItem` — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`react-pro`**, **`testing-pro`**, **`security-pro`**, **`deployment-pro`**, **`mobile-design-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

Expo SDK, RN major, Reanimated matrix — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Expo vs bare/prebuild, SDK/RN versions, iOS/Android, physical vs sim if relevant.
2. **Problem / goal** — UI bug, perf, navigation, build, or a11y gap.
3. **System design** — JS thread vs native, list window, or nav timing — **`react-native-runtime-and-threading-system-model.md`**.
4. **Decision reasoning** — Component/list/nav choice — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Minimal RN/Expo snippets; config only when grounded in docs — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Complexity, upgrade path, Android vs iOS divergence.
7. **Failure modes** — Keys, back handler, OTA misuse, layout loops — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Untested devices, native module matrix, hand off to **`security-pro`** / **`deployment-pro`** / **`performance-tuning-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Runtime & threading model** | [references/react-native-runtime-and-threading-system-model.md](references/react-native-runtime-and-threading-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| UI/UX design | [references/ui-ux-design.md](references/ui-ux-design.md) |
| Tips & performance | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** `FlatList` jank on long chat list; recent Expo SDK.  
**Expected output:** Full **Suggested response format** — keys, memo row, window props, FlashList only after measure — **`failure-modes-detection-mitigation.md`**.

### 2 — Tricky (edge case)

**Input:** Android back closes app from nested stack instead of closing modal.  
**Expected output:** `BackHandler` ordering, stack vs modal policy, cold-start deep link — **`edge-cases.md`**, **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Secure API tokens from RN.  
**Expected output:** **`react-native-pro`** secure storage patterns — **`security-pro`** threat model — no custom crypto in JS alone.

## Checklist before calling the skill done

### UX and a11y

- [ ] `accessibilityLabel` / `accessibilityRole` on tappable elements — **`quality-validation-and-guardrails.md`**.
- [ ] Safe areas and `StatusBar` match screen theme — **`ui-ux-design.md`**.

### Layout and input

- [ ] Keyboard does not hide primary actions; Android `softInputMode` considered — **`edge-cases.md`**.
- [ ] No `onLayout` ↔ `setState` feedback loop — **`failure-modes-detection-mitigation.md`**.

### Lists and perf

- [ ] Stable list keys; images bounded — **`anti-patterns.md`**.
- [ ] Profiler evidence before FlashList or heavy animation refactors — **`tips-and-tricks.md`**.

### Platform and ship

- [ ] Android back and iOS gesture-back behavior for stacks/modals — **`edge-cases.md`**.
- [ ] Loading / error / empty for async UIs — **`ui-ux-design.md`**.
- [ ] OTA vs store build understood if change touches native — **`decision-tree.md`**.
- [ ] APIs match **stated SDK** — **`quality-validation-and-guardrails.md`**.
- [ ] **`integration-map.md`** used when security, release, or design system dominates.
