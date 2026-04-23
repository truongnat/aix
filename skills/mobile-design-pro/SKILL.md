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

1. Confirm device classes, platform priorities, implementation stack.
2. Apply summaries; open `references/`; defer component APIs to **`react-native-pro`** / **`flutter-pro`**.
3. Respond with **Suggested response format**; include **failure modes** for gestures, keyboard, and a11y.

### Operating principles

1. **Touch first** — Generous targets — **`mobile-ux-constraints-system-model.md`**.
2. **Safe areas & system UI** — Notch, keyboard, gesture bar — **`touch-layout-safe-areas-and-density.md`**.
3. **Platform-appropriate** — HIG/Material unless documented brand exception — **`navigation-and-platform-ios-android.md`**.
4. **One critical task per critical screen** — Cognitive load — **`tips-and-tricks.md`**.
5. **Accessibility default** — **`edge-cases.md`**.
6. **Real devices** — **`tips-and-tricks.md`**.

### Mobile UX constraints system model (summary)

Hardware → OS chrome → app layout → controls — **`mobile-ux-constraints-system-model.md`**.

Details: [references/mobile-ux-constraints-system-model.md](references/mobile-ux-constraints-system-model.md)

### Failure modes — detection and mitigation (summary)

Targets, keyboard, gestures, motion-only, RTL, fold, store risk — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Parity vs native-first; density; motion — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Platform numbers; scope vs implementation — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Touch, layout, safe areas (summary)

Targets, keyboard, density — **`touch-layout-safe-areas-and-density.md`**.

Details: [references/touch-layout-safe-areas-and-density.md](references/touch-layout-safe-areas-and-density.md)

### Navigation & platforms (summary)

iOS/Android patterns — **`navigation-and-platform-ios-android.md`**.

Details: [references/navigation-and-platform-ios-android.md](references/navigation-and-platform-ios-android.md)

### Web responsive (cross-skill)

Browser breakpoints — **`design-system-pro`**: [../design-system-pro/references/a11y-responsive-and-web-typography.md](../design-system-pro/references/a11y-responsive-and-web-typography.md)

### Tips and tricks (summary)

Onboarding, permissions, haptics — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

a11y, i18n, hardware, network, store — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

**`decision-tree.md`** · **`anti-patterns.md`**.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`design-system-pro`**, **`react-native-pro`**, **`flutter-pro`**, **`testing-pro`**, **`security-pro`**, … — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### OS and guideline versions (summary)

**`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Device class, platform priority, stack (RN/Flutter/native), accessibility baseline.
2. **Problem / goal** — Screen/flow (e.g. checkout, onboarding).
3. **System design** — Constraint layers; where primary action sits — **`mobile-ux-constraints-system-model.md`**.
4. **Decision reasoning** — Native vs parity; density; bottom vs top — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Deliverable sketch** — Layout rules, spacing/target checklist — not fabricated frames — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Information density vs errors; animation vs clarity.
7. **Failure modes** — Keyboard, gestures, dynamic type, store — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Untested fold/tablet; delegate APIs to **`react-native-pro`** / **`flutter-pro`**; **`security-pro`** for sensitive UI.

## Resources in this skill

| Topic | File |
|-------|------|
| **UX constraints model** | [references/mobile-ux-constraints-system-model.md](references/mobile-ux-constraints-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Touch, safe area, density | [references/touch-layout-safe-areas-and-density.md](references/touch-layout-safe-areas-and-density.md) |
| Navigation & iOS/Android | [references/navigation-and-platform-ios-android.md](references/navigation-and-platform-ios-android.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Primary “Save” top-right on 6" phone — missed one-handed.  
**Expected output:** Full **Suggested response format** — thumb zone; bottom/sticky primary — **`failure-modes-detection-mitigation.md`**; **`react-native-pro`** for implementation.

### 2 — Tricky (edge case)

**Input:** Heavy onboarding animation — dizziness complaints.  
**Expected output:** Reduce motion path; static alternative — **`edge-cases.md`**; **failure modes** motion-only — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Same nav as React web in RN.  
**Expected output:** **This skill** native patterns — **`design-system-pro`** tokens — **`react-native-pro`** navigation — anti **web metaphor** — **`anti-patterns.md`**.

## Checklist before calling the skill done

### UX core

- [ ] **Touch** targets and spacing justified — **`touch-layout-safe-areas-and-density.md`**.
- [ ] **Safe area** / keyboard / gesture bar — **`mobile-ux-constraints-system-model.md`**.
- [ ] **iOS vs Android** called out when divergent — **`navigation-and-platform-ios-android.md`**.

### Inclusion & risk

- [ ] **Accessibility** (dynamic type, SR) — **`edge-cases.md`**.
- [ ] **Motion** / haptics restrained — **`decision-framework-and-trade-offs.md`**.
- [ ] **Failure modes** when keyboard, gestures, or store risk applies — **`failure-modes-detection-mitigation.md`**.

### Handoff

- [ ] Code/API work → **`react-native-pro`** / **`flutter-pro`** when applicable.
- [ ] **Tablet / foldable** test plan stated or deferred — **`decision-tree.md`**.
