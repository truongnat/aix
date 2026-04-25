---
name: design-system-pro
description: |
  Production-grade product UI design: design systems, visual foundations, accessibility baselines, data-dense interfaces, guidelines and consistency, web vs native vs desktop patterns, themes and visual direction, token pipeline (primitive → semantic → component → code), failure modes (token drift, a11y regression, dark contrast, chart honesty, i18n), decision frameworks (maturity, build vs buy, density × audience), quality guardrails (no invented brand colors, WCAG pairs only with context), trend-aware (judgment-first) styling.

  Use this skill when the user asks about design tokens, component libraries, Figma variables, UI kits, WCAG contrast, typography and spacing scales, dashboards and data tables, dark/light themes, **semantic token mapping**, **AI/copilot/chat UI**, streaming assistant layouts, citations and tool-use UI, design documentation, visual trends, brand-consistent UI, or cross-platform UX patterns.

  Use **with** **`mobile-design-pro`** for **mobile-native** touch, safe area, and iOS/Android UX depth; implementation skills: **`react-pro`** / **`nextjs-pro`** (web), **`react-native-pro`** / **`flutter-pro`** (mobile), **`electron-pro`** / **`tauri-pro`** (desktop), **`testing-pro`** (visual regression), **`business-analysis-pro`** / **`content-analysis-pro`** when UX outcomes or brand inputs need grounding. This skill owns **design language, system rules, and UX patterns**; framework skills own **code APIs**.

  Triggers: "design system", "design tokens", "UI kit", "Figma", "component library", "style guide", "baseline", "WCAG", "accessibility", "dark mode", "semantic color", "CSS variables theme", "dashboard", "data table", "UX", "UI", "visual design", "consistency", "spacing", "typography", "color palette", "HIG", "Material", "Fluent", "brand", "handoff", "trend", "motion", "responsive", "copilot", "chat UI", "AI assistant", "streaming UI", "RAG UI", "citations", "focus ring", "live region", "token naming", "density scale", "glassmorphism".

metadata:
  short-description: Design system — token pipeline, failure modes, guidelines, data UI, dark theme & AI copilot deep dives
  content-language: en
  domain: design-system
  level: professional
---

# Design system (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use platform **Human Interface Guidelines** and **Material Design** (or your chosen baseline) as references for native-feeling patterns; this skill encodes **token-driven consistency**, **accessible baselines**, and **product-level** visual discipline — not a replacement for brand designers or user research. Confirm **brand constraints**, **platforms** (web, iOS/Android, desktop), and **primary use case** (marketing site vs **data-heavy** app).

## Boundary

**`design-system-pro`** owns **what** should look and behave like at the UX/UI layer: tokens, patterns, themes, a11y baselines, data presentation ethics, governance. Framework skills (**`react-pro`**, **`nextjs-pro`**, **`react-native-pro`**, …) own **how** to implement components and APIs. **`testing-pro`** owns **automated** visual and a11y gates in CI.

## Related skills (this repo)

| Skill | When to combine with `design-system-pro` |
|-------|----------------------------------------|
| **`react-pro`** / **`nextjs-pro`** | Implementing components, CSS/Tailwind, App Router layouts |
| **`mobile-design-pro`** | Touch targets, safe areas, mobile navigation — **before** copying web pixels to native |
| **`react-native-pro`** / **`flutter-pro`** | RN/Flutter APIs, navigation, lists, performance |
| **`electron-pro`** / **`tauri-pro`** | Desktop windowing, shortcuts, dense layouts |
| **`testing-pro`** | Visual regression, a11y automation in CI |
| **`seo-pro`** | Heading hierarchy on marketing pages |
| **`ai-integration-pro`** | Streaming/tool UI wiring to backend |
| **`business-analysis-pro`** | UX acceptance criteria and measurable outcomes tied to DS investment |
| **`content-analysis-pro`** | Extract constraints from brand decks/PDFs before tokenizing |

## When to use

- Defining or evolving a **design system** (tokens, primitives, documentation).
- Setting **baseline**: type scale, spacing, color roles, **WCAG** targets, **data** density.
- **Web vs app vs desktop** — adapting patterns without cloning the wrong platform.
- **Themes** (light/dark), **semantic mapping**, **visual direction**, trend evaluation (fit vs fad).
- **Consistency** audits, handoff rules, governance anti-patterns.
- **AI/copilot** UI: streaming layout, citations, tool states, live regions.

## When not to use

- **Pure framework/API implementation** with no UX/system question — **`react-pro`** / **`nextjs-pro`** / …
- **SEO/CWV audit as the main question** — **`seo-pro`** (pair when marketing + DS overlap).
- **Accessibility legal interpretation** — this skill gives **product baseline**; compliance scope needs human/legal review.

## Required inputs

- **Brand** constraints (or explicit “unknown” → use neutral placeholders — **`quality-validation-and-guardrails.md`**).
- **Platform(s)** and **density** (marketing vs analytics vs copilot-heavy).

## Expected output

Follow **Suggested response format** strictly — system design through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** brand/platform scope, **data density**, and which **implementation skill** applies. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.