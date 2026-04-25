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