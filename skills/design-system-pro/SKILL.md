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

### Operating principles

1. **Think Before Coding** — Confirm brand constraints, platform targets, density, and use case before proposing system rules. Ask when visual ambition conflicts with accessibility or product context.
2. **Simplicity First** — Start with the smallest token/pattern set that creates consistency. Do not add ornamental complexity, extra themes, or component variants without clear need.
3. **Surgical Changes** — Touch only the token layer, pattern, or UX rule directly involved. Do not redesign unrelated surfaces under the banner of “system cleanup.”
4. **Goal-Driven Execution** — Done = the visual/system recommendation is implementable, consistent across target surfaces, and has explicit success criteria.
5. **Tokens express intent** — Semantic mapping matters more than raw color names or one-off visual choices.
6. **Accessibility is baseline, not polish** — Contrast, focus, hierarchy, and density choices must hold before style experiments.
7. **Platform fit beats visual uniformity** — Web, mobile, and desktop can share language without becoming pixel-identical clones.
8. **Design systems serve product use** — Data-heavy, marketing, and copilot surfaces need different defaults; one visual grammar does not fit all equally.

## Default recommendations by scenario

- **New design system** — Define foundations and token semantics before component-level polish.
- **Inconsistent UI** — Audit semantic token drift and pattern duplication before inventing new styles.
- **Dense application UI** — Optimize readability, hierarchy, and action clarity before visual flourishes.
- **AI/copilot UI** — Prioritize streaming states, citations, and tool-use clarity before novelty.

## Decision trees

Summary: choose system depth, token structure, and platform adaptation based on product density, team maturity, and target surfaces.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: token drift, inaccessible dark themes, generic trend copying, and treating design systems as visual decoration instead of product infrastructure.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Token pipeline and source of truth (summary)

How primitive, semantic, and component tokens should relate so system changes remain controlled.

Details: [references/token-pipeline-and-source-of-truth.md](references/token-pipeline-and-source-of-truth.md)

### Foundations, baseline, and data UI (summary)

How typography, spacing, color roles, and density support usable product interfaces, especially data-heavy ones.

Details: [references/foundations-baseline-and-data-ui.md](references/foundations-baseline-and-data-ui.md)

### Design system guidelines and consistency (summary)

How governance, pattern reuse, and documentation keep UI systems coherent over time.

Details: [references/design-system-guidelines-and-consistency.md](references/design-system-guidelines-and-consistency.md)

### Platforms: web, app, desktop (summary)

How shared design language should adapt across platform interaction models and constraints.

Details: [references/platforms-web-app-desktop.md](references/platforms-web-app-desktop.md)

### AI/copilot UI patterns (summary)

How streaming, citations, tool states, and assistant surfaces affect system-level component choices.

Details: [references/ai-copilot-ui-patterns-deep-dive.md](references/ai-copilot-ui-patterns-deep-dive.md)

### Failure modes and mitigation (summary)

Contrast regressions, token entropy, misleading charts, and cross-platform mismatch patterns to catch early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes for design-token tooling, platform baselines, and implementation constraints that affect DS recommendations.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Brand, platforms, use case, density, and implementation stack.
2. **System model** — Explain the token, pattern, and platform-adaptation logic behind the recommendation.
3. **Recommendation** — Minimum system change or rule set with rationale.
4. **Verification** — How to validate consistency, accessibility, and implementation fit.
5. **Residual risks** — Remaining platform, governance, or accessibility caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Token pipeline and source of truth | [references/token-pipeline-and-source-of-truth.md](references/token-pipeline-and-source-of-truth.md) |
| Foundations, baseline, and data UI | [references/foundations-baseline-and-data-ui.md](references/foundations-baseline-and-data-ui.md) |
| Design system guidelines and consistency | [references/design-system-guidelines-and-consistency.md](references/design-system-guidelines-and-consistency.md) |
| Platforms: web, app, desktop | [references/platforms-web-app-desktop.md](references/platforms-web-app-desktop.md) |
| AI/copilot UI patterns | [references/ai-copilot-ui-patterns-deep-dive.md](references/ai-copilot-ui-patterns-deep-dive.md) |
| A11y, responsive, and web typography | [references/a11y-responsive-and-web-typography.md](references/a11y-responsive-and-web-typography.md) |
| Dark mode and semantic theming | [references/dark-mode-and-semantic-theming-deep-dive.md](references/dark-mode-and-semantic-theming-deep-dive.md) |
| Trends, themes, and visual language | [references/trends-themes-and-visual-language.md](references/trends-themes-and-visual-language.md) |
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

**Input:** "Define tokens for a new analytics dashboard."
- Start with semantic color, spacing, and typography roles tuned for dense data UI.
- Avoid component proliferation before foundations are stable.
- **Verify:** The token set maps cleanly to repeated dashboard patterns and passes baseline contrast checks.

**Input (tricky):** "Make our app look more modern by adding glassmorphism everywhere."
- Check product fit, readability, and interaction cost before copying a trend.
- Use trend language only where it improves the specific surface.
- **Verify:** The visual direction still supports hierarchy and accessibility on target devices.

**Input (cross-skill):** "We need a design system for a copilot interface implemented in Next.js."
- Pair **`nextjs-pro`** for implementation mechanics and let **`design-system-pro`** define streaming, citation, and tool-state patterns.
- Keep system language and framework wiring clearly separated.
- **Verify:** The system spec can be translated into components without inventing new UX rules mid-build.

## Checklist before calling the skill done

- [ ] Brand, platforms, density, and product use case confirmed first (Think Before Coding)
- [ ] Minimum viable token/pattern system chosen; no unnecessary design sprawl (Simplicity First)
- [ ] Only the relevant design-system layer or pattern was changed (Surgical Changes)
- [ ] Success criteria for consistency, accessibility, and implementation fit are explicit (Goal-Driven Execution)
- [ ] Semantic token intent is clear
- [ ] Accessibility baseline is preserved
- [ ] Platform differences are handled intentionally
- [ ] Residual governance or theming risks are documented
