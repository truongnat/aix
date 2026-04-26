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

### Operating principles

1. **Think Before Coding** — Confirm device classes, primary platform, accessibility needs, and use context before proposing mobile UX changes. Ask when phone/tablet or iOS/Android priorities differ.
2. **Simplicity First** — Start with the smallest layout and interaction change that improves usability. Do not add new navigation patterns or visual complexity without need.
3. **Surgical Changes** — Touch only the relevant screen flow, touch target, layout region, or gesture rule. Do not redesign the whole app under one mobile complaint.
4. **Goal-Driven Execution** — Done = the target mobile interaction is usable on the intended devices and verified against platform constraints.
5. **Ergonomics are product logic** — Reach, safe areas, keyboard overlap, and gesture conflict are not cosmetic concerns.
6. **Platform conventions matter** — Parity is useful only up to the point where it degrades native expectations.
7. **Density must respect touch** — More content is not better if taps, focus, or scanning degrade.
8. **Accessibility survives small screens** — Dynamic type, reduce motion, VoiceOver/TalkBack, and RTL should influence layout decisions directly.

## Default recommendations by scenario

- **Crowded screen** — Reduce visible blocks and clarify action hierarchy before shrinking typography.
- **Navigation issue** — Fix back behavior and route expectation before adding more entry points.
- **Form issue** — Address keyboard, safe area, and focus progression before styling polish.
- **Cross-platform mismatch** — Decide intentionally where parity matters and where native behavior should win.

## Decision trees

Summary: choose the right mobile UX intervention based on device class, interaction pattern, and platform-specific expectation.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: tiny CTAs, web-first layouts pasted onto mobile, gesture conflicts, and motion-only or color-only cues on small screens.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Mobile UX constraints system model (summary)

How hardware, OS chrome, reach, and layout constraints shape what is actually usable on mobile devices.

Details: [references/mobile-ux-constraints-system-model.md](references/mobile-ux-constraints-system-model.md)

### Touch, layout, safe areas, and density (summary)

How to balance information density with tap targets, keyboard behavior, and safe-area rules.

Details: [references/touch-layout-safe-areas-and-density.md](references/touch-layout-safe-areas-and-density.md)

### Navigation and platform behavior (summary)

How iOS and Android navigation patterns, sheets, and back expectations differ in practice.

Details: [references/navigation-and-platform-ios-android.md](references/navigation-and-platform-ios-android.md)

### Failure modes and mitigation (summary)

Keyboard occlusion, gesture collision, RTL/foldable issues, and accessibility regressions that often appear late.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect platform conventions, implementation constraints, and evolving mobile behavior expectations.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Device classes, primary platforms, stack, and interaction surface involved.
2. **Mobile UX model** — Explain the relevant ergonomic or platform constraint.
3. **Recommendation** — Minimum UX/layout/navigation change with rationale.
4. **Verification** — Device and accessibility checks that prove the change works.
5. **Residual risks** — Remaining platform, accessibility, or density caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Mobile UX constraints system model | [references/mobile-ux-constraints-system-model.md](references/mobile-ux-constraints-system-model.md) |
| Touch, layout, safe areas, and density | [references/touch-layout-safe-areas-and-density.md](references/touch-layout-safe-areas-and-density.md) |
| Navigation and platform behavior | [references/navigation-and-platform-ios-android.md](references/navigation-and-platform-ios-android.md) |
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

**Input:** "This onboarding screen feels too crowded on phones."
- Reduce visible blocks and prioritize the main action before tweaking font size.
- Keep touch ergonomics ahead of decorative layout.
- **Verify:** The flow is scannable and tappable on representative phone sizes.

**Input (tricky):** "One design must work identically on iPhone and Android."
- Clarify where parity helps and where native conventions should differ.
- Preserve user expectation over forced symmetry.
- **Verify:** Each platform still feels native while preserving the product’s core flow.

**Input (cross-skill):** "Design a mobile payment form and implement it in Flutter."
- Pair **`mobile-design-pro`** for UX rules and **`flutter-pro`** for widget-level execution.
- Keep UX intent and framework mechanics distinct.
- **Verify:** The design rules translate into a Flutter implementation without keyboard or safe-area regressions.

## Checklist before calling the skill done

- [ ] Device classes, platform priority, and accessibility needs confirmed first (Think Before Coding)
- [ ] Minimum UX change chosen; no unnecessary mobile-pattern sprawl (Simplicity First)
- [ ] Only the relevant screen flow or interaction surface was changed (Surgical Changes)
- [ ] Success criteria and device/accessibility verification are explicit (Goal-Driven Execution)
- [ ] Safe area, reach, and keyboard behavior are considered
- [ ] Platform conventions are handled intentionally
- [ ] Density preserves tapability and readability
- [ ] Residual accessibility or device-class caveats are documented
