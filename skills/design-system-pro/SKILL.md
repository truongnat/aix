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

1. Confirm brand/platform scope, **data density**, and which **implementation skill** applies.
2. Apply summaries; open `references/` when depth is needed; defer **framework code** to **`react-pro`** / **`nextjs-pro`** / … when the task is implementation-only.
3. Respond using **Suggested response format**; call out **failure modes** and **residual risks** — not only happy path.

### Operating principles

1. **Tokens before pixels** — Name and reuse; exceptions documented — **`token-pipeline-and-source-of-truth.md`**.
2. **Accessibility is not optional** — Baseline **AA** contrast and keyboard/focus as default product quality.
3. **Data honesty** — Charts and metrics **readable**; no decorative distortion — **`foundations-baseline-and-data-ui.md`**.
4. **One product voice** — Components and microcopy follow the same guidelines — **`design-system-guidelines-and-consistency.md`**.
5. **Trends serve users** — Adopt visual fashion only when it does not harm clarity or a11y — **`trends-themes-and-visual-language.md`**.
6. **Platform-appropriate** — Mouse vs touch vs window conventions per surface — **`platforms-web-app-desktop.md`**.

### Token pipeline and source of truth (summary)

Primitive → semantic → component → framework; design ↔ code naming — **`token-pipeline-and-source-of-truth.md`**.

Details: [references/token-pipeline-and-source-of-truth.md](references/token-pipeline-and-source-of-truth.md)

### Failure modes — detection and mitigation (summary)

Token drift, a11y regression, dark contrast, chart dishonesty, i18n overflow, motion/CLS — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Maturity stages, build vs buy, density × audience — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No invented palettes; WCAG claims need pairs; platform honesty — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Foundations, baseline, and data UI (summary)

Typography, spacing, color **roles**, elevation; **WCAG** baseline; **tables and dashboards** — alignment, density, chart honesty.

Details: [references/foundations-baseline-and-data-ui.md](references/foundations-baseline-and-data-ui.md)

### Accessibility, responsive web, and font loading (summary)

**WCAG AA** contrast targets; **`prefers-reduced-motion`**; **breakpoint** discipline; **`font-display: swap`** — web responsive layer (not native mobile — **`mobile-design-pro`**).

Details: [references/a11y-responsive-and-web-typography.md](references/a11y-responsive-and-web-typography.md)

### Web performance basics (summary)

Layout thrash, **`will-change`** discipline, **lazy** images, **CLS** awareness — pair with **`seo-pro`** for CWV in search context.

Details: [references/web-performance-basics.md](references/web-performance-basics.md)

### Design system guidelines and consistency (summary)

Tokens, primitives, **documentation**, governance, **design ↔ code** naming.

Details: [references/design-system-guidelines-and-consistency.md](references/design-system-guidelines-and-consistency.md)

### Platforms: web, app, desktop (summary)

Responsive web, **native** mobile patterns, **desktop** shells.

Details: [references/platforms-web-app-desktop.md](references/platforms-web-app-desktop.md)

### Trends, themes, and visual language (summary)

Dark/light overview, brand beyond primary color, **motion** purpose; trends with **judgment-first** caveats.

Details: [references/trends-themes-and-visual-language.md](references/trends-themes-and-visual-language.md)

### Dark mode & semantic theming (deep dive) (summary)

**Primitive → semantic → component** token layers; dark **surfaces** (not inverted light); **borders/elevation** on dark; WCAG on real pairs; Figma variable **modes**.

Details: [references/dark-mode-and-semantic-theming-deep-dive.md](references/dark-mode-and-semantic-theming-deep-dive.md)

### AI & copilot UI (deep dive) (summary)

**Side dock / inline / modal** layouts; **streaming**; **citations** and trust; **tool-use** states; **live regions**; stop/regenerate/feedback.

Details: [references/ai-copilot-ui-patterns-deep-dive.md](references/ai-copilot-ui-patterns-deep-dive.md)

### Tips and tricks (summary)

Handoff, loading/empty states, **one primary action**, UI critique habits.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

i18n/RTL, color-only status, custom controls, theme assets, third-party embeds, SPA/theme flash, rebrand migration.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

Marketing vs data density; dark semantic surfaces; token vs one-off — **`decision-tree.md`** · **`anti-patterns.md`**.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`mobile-design-pro`**, **`react-pro`** / **`nextjs-pro`**, RN/Flutter, desktop, **`testing-pro`**, **`seo-pro`**, **`ai-integration-pro`**, **`business-analysis-pro`**, **`content-analysis-pro`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

WCAG edition, HIG/Material year, browser baseline, Figma variables API.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Brand/source of truth (or gaps), platforms, density (marketing / data / copilot), audience.
2. **Problem / goal** — Token audit, new pattern, theme, a11y fix, governance, etc.
3. **System design** — Token pipeline, semantic layers, documentation/governance hooks — **`token-pipeline-and-source-of-truth.md`**; deep theme or copilot topics → cite matching **deep dive** when non-trivial.
4. **Decision reasoning** — Maturity, build vs buy, density/theme/platform — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Token names, checklist, layout rules — **no invented brand hex or Figma paths** — **`quality-validation-and-guardrails.md`**; defer full code to **`react-pro`** / **`nextjs-pro`** / … when appropriate.
6. **Trade-offs** — Velocity vs governance; uniqueness vs maintenance; trend cost.
7. **Failure modes** — Top risks for this design (drift, a11y, dark pairs, charts, i18n, motion) — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Unknown brand inputs, compliance scope, engineering estimate, **Related skill** for implementation/testing.

## Resources in this skill

| Topic | File |
|-------|------|
| Token pipeline & source of truth | [references/token-pipeline-and-source-of-truth.md](references/token-pipeline-and-source-of-truth.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Foundations & data UI | [references/foundations-baseline-and-data-ui.md](references/foundations-baseline-and-data-ui.md) |
| **A11y, responsive web, fonts** | [references/a11y-responsive-and-web-typography.md](references/a11y-responsive-and-web-typography.md) |
| Web performance (basics) | [references/web-performance-basics.md](references/web-performance-basics.md) |
| Guidelines & consistency | [references/design-system-guidelines-and-consistency.md](references/design-system-guidelines-and-consistency.md) |
| Web / app / desktop | [references/platforms-web-app-desktop.md](references/platforms-web-app-desktop.md) |
| Trends & themes (overview) | [references/trends-themes-and-visual-language.md](references/trends-themes-and-visual-language.md) |
| **Dark mode & semantic theming (deep dive)** | [references/dark-mode-and-semantic-theming-deep-dive.md](references/dark-mode-and-semantic-theming-deep-dive.md) |
| **AI & copilot UI (deep dive)** | [references/ai-copilot-ui-patterns-deep-dive.md](references/ai-copilot-ui-patterns-deep-dive.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

**Input (simple):** Dashboard uses seven different grays and three border radii on one page.  
**Expected output:** **Suggested response format** — token set for `border`, `surface`, `radius`; migration path; single **density** preset; defer CSS variables to **`nextjs-pro`** / **`react-pro`**.

**Input (tricky):** Shipping dark mode — body text looks fine in Figma but fails contrast on real surfaces.  
**Expected output:** Semantic mapping per theme; **border/elevation** on dark; verify pairs on **raised** surfaces — [references/dark-mode-and-semantic-theming-deep-dive.md](references/dark-mode-and-semantic-theming-deep-dive.md); **failure modes** for wrong semantic pairs.

**Input (cross-skill):** “Copilot panel in Next.js app — layout and trust UI.”  
**Expected output:** **This skill** for streaming, citations, tool states, live regions — **`ai-copilot-ui-patterns-deep-dive.md`**; **`nextjs-pro`** / **`ai-integration-pro`** for data/SSE; **`testing-pro`** for a11y + visual regression.

## Checklist before calling the skill done

### System & baseline

- [ ] **Baseline** (type, space, color roles) and **a11y** targets stated for the context.
- [ ] **Token pipeline** or governance stance acknowledged — **`token-pipeline-and-source-of-truth.md`** when defining/evolving a system.
- [ ] **Platform** (web / native / desktop) appropriate — not one-size-fits-all.

### Safety & integration

- [ ] **WCAG / contrast** claims tied to **pairs** or tokens — **`quality-validation-and-guardrails.md`**.
- [ ] **Failure modes** section present — **`failure-modes-detection-mitigation.md`** themes when shipping patterns or themes.
- [ ] Pure **implementation** work pointed to the right **framework skill** when applicable.

### Depth triggers

- [ ] **Dark theme** or **semantic mapping**: opened **deep dive** when detail needed.
- [ ] **AI assistant / streaming UI**: opened **copilot deep dive** when detail needed.
- [ ] **Motion** (`prefers-reduced-motion`) and **focus** visibility considered for interactive patterns.

### Data & consistency

- [ ] **Data** presentation rules (alignment, units, empty states, charts) when relevant — **`foundations-baseline-and-data-ui.md`**.
- [ ] **Consistency** mechanism (tokens, governance) — not only one-off screens — **`design-system-guidelines-and-consistency.md`**.
