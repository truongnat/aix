---
name: mobile-design-pro
description: |
  Production-grade mobile product design: touch targets, safe areas, thumb reach, density, navigation (tabs, stacks, sheets), iOS vs Material behavior, keyboards and forms, accessibility on small screens, offline and permissions — plus mobile UX constraint layers (hardware → OS chrome → layout), failure modes (tiny CTAs, keyboard occlusion, gesture conflict, RTL/fold issues, motion-only cues), trade-offs (parity vs native-first, density), guardrails (44pt vs 48dp honesty, no store approval promises).

  Use this skill when designing or reviewing **mobile-native** UX (phone/tablet), gestures, onboarding, foldables, or comparing HIG vs Material.

  Use **with** **`design-system-pro`** (tokens, dark mode), **`react-native-pro`** / **`flutter-pro`** (SafeArea, navigation, keyboard avoidance), **`testing-pro`**, **`performance-tuning-pro`**, **`security-pro`** when sensitive UI matters. This skill owns **mobile-specific UX rules**; framework skills own **code**.

  Triggers: "mobile design", "mobile UX", "iOS HIG", "Material Design mobile", "touch target", "safe area", "notch", "bottom navigation", "thumb zone", "one-handed", "mobile keyboard", "gesture", "bottom sheet", "mobile onboarding", "tablet layout", "foldable", "mobile a11y", "VoiceOver", "TalkBack", "dynamic type", "hitSlop", "home indicator", "predictive back", "reduce motion", "large content size", "split view iPad", "Cupertino vs Material".

metadata:
  short-description: Mobile design — constraint model, touch/safe area, iOS/Android, failure modes
  content-language: en
  domain: mobile-ux
  level: professional
---

# Mobile design (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) and [Material Design](https://m3.material.io/) for platform truth; this skill encodes **touch-first ergonomics**, **safe-area discipline**, and **platform-appropriate** patterns.

## Boundary

**`mobile-design-pro`** owns **mobile UX and layout intent** (targets, flows, platform conventions). **`react-native-pro`** / **`flutter-pro`** own **implementation APIs**. **`design-system-pro`** owns **web** responsive/CSS and cross-surface tokens when the primary surface is **browser**.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`design-system-pro`** | Tokens, typography, themes; **web** breakpoints/CSS when comparing to browser |
| **`react-native-pro`** | RN/Expo: SafeAreaView, navigation, KeyboardAvoidingView |
| **`flutter-pro`** | Material/Cupertino, `SafeArea`, layout APIs |
| **`testing-pro`** | Maestro/Detox, screenshots per device class |
| **`performance-tuning-pro`** | Scroll jank, animation cost |
| **`security-pro`** | Sensitive on-screen data, biometric flows |

## When to use

- Touch layout, thumb zones, safe areas, keyboard overlap.
- Navigation patterns, back expectations, sheets/modals.
- Onboarding, permissions, offline/error states.
- Dynamic type, RTL, reduce motion, VoiceOver/TalkBack.
- Tablets, foldables, landscape.

## When not to use

- **Semantic image understanding** — **`content-analysis-pro`**.
- **Pure web CSS layout** — **`design-system-pro`**.

## Required inputs

- **Phone vs tablet**, **primary platform**, **stack** (RN/Flutter/native).
- **Accessibility** constraints (dynamic type range) if known.

## Expected output

Follow **Suggested response format** strictly.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** device classes, platform priorities, implementation stack. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.