# Quality validation and guardrails (anti-hallucination)

## Platform rules

- [ ] **Apple vs Google** minimum touch guidance differs (~**44 pt** vs **48 dp**) — cite the **guideline** for the target platform — **`versions.md`**.
- [ ] Do **not** promise **App Store / Play** approval from design alone — legal + product — **`edge-cases.md`**.

## Deliverables

- [ ] Prefer **spacing sketches** and **rules** over fake pixel-perfect frames for unknown brand.
- [ ] **`SafeArea`** / **`KeyboardAvoiding`** are **implementation** concerns — point to **`react-native-pro`** / **`flutter-pro`**, don’t invent API flags.

## Scope

- [ ] **Screenshot “what’s in this image?”** → **`content-analysis-pro`** — not this skill.
- [ ] **Web-only** `@media` and CSS — **`design-system-pro`** when the surface is browser.
