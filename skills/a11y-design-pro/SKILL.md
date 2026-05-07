---
name: a11y-design-pro
description: |
  Accessible and inclusive design: WCAG 2.1/2.2 compliance, ARIA patterns, keyboard navigation, screen reader optimization, color contrast, semantic HTML, and automated accessibility testing pipelines.

  Use this skill when auditing or implementing accessibility for web UIs, adding ARIA to dynamic components, setting up axe/Lighthouse CI gates, designing for diverse users (visual, motor, cognitive, hearing), or ensuring legal compliance (ADA, EN 301 549, EAA).

  Do not use for general UI/UX design aesthetics (use design-system-pro) or responsive layout (use frontend-design-pro).

  Triggers: "accessibility", "a11y", "WCAG", "ARIA", "screen reader", "keyboard navigation", "color contrast", "axe", "WAVE", "Lighthouse accessibility", "inclusive design", "ADA compliance", "focus management".

metadata:
  short-description: "Accessibility — WCAG 2.1/2.2, ARIA, keyboard nav, screen readers, automated testing"
  content-language: en
  domain: frontend-engineering
  level: professional
---

# Accessibility Design (professional)

Skill text is **English**; match the user's response language when applicable.

Use [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/), [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), and [axe-core](https://github.com/dequelabs/axe-core) as authority. This skill encodes **WCAG compliance auditing**, **ARIA widget patterns**, **keyboard navigation**, **focus management**, **color contrast**, and **automated accessibility CI/CD**. Confirm **WCAG target level**, **legal requirements**, **target assistive technologies**, and **existing violation count** before proposing fixes.

## Boundary

**`a11y-design-pro`** owns **WCAG compliance**, **ARIA implementation**, **keyboard navigation**, **focus management**, **screen reader testing**, **color contrast**, and **automated a11y pipelines**. It does **not** own general design aesthetics, responsive layout, or design system components — combine with other skills as needed.

| Skill | When to combine with **`a11y-design-pro`** |
|-------|---------------------------------------------|
| **`design-system-pro`** | When fixing contrast requires updating design tokens |
| **`react-pro`** / **`nextjs-pro`** | When implementing ARIA in React components |
| **`ai-design-pro`** | When AI-generated color palettes must pass WCAG contrast |
| **`testing-pro`** | When integrating axe-core into a test suite |
| **`frontend-design-pro`** | When accessibility fixes affect responsive layout |

## When to use

- Auditing an existing UI for WCAG 2.1/2.2 compliance (Level A, AA, AAA).
- Implementing ARIA roles, states, and properties for dynamic widgets (tabs, modals, accordions, carousels).
- Setting up automated accessibility testing in CI (axe-core, Playwright, pa11y).
- Fixing keyboard navigation and focus trap issues.
- Validating color contrast ratios (4.5:1 AA, 7:1 AAA).
- Testing with screen readers: NVDA, JAWS, VoiceOver, TalkBack.
- Ensuring legal compliance: ADA (US), EN 301 549 (EU), EAA 2025.
- Trigger keywords: `accessibility`, `a11y`, `WCAG`, `ARIA`, `screen reader`, `keyboard nav`, `color contrast`, `focus trap`, `ADA`

## When not to use

- **Visual design aesthetics** (color choices, typography) — use **`design-system-pro`**.
- **Responsive layout** — use **`frontend-design-pro`**.
- **General test automation** (non-a11y) — use **`testing-pro`**.

## Required inputs

- **WCAG target level** — A, AA (most common), or AAA.
- **Legal/compliance context** — ADA, EN 301 549, CVAA, or internal policy.
- **Target assistive technologies** — screen readers (NVDA/JAWS/VoiceOver), switch access, voice control.
- **Current violation count** — axe report, Lighthouse score, or manual audit output.
- **Framework** — React, Vue, plain HTML; determines ARIA implementation approach.

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** WCAG level, legal context, assistive tech targets → verify: [requirements documented].
2. **Audit first** — run automated scan (axe, Lighthouse); categorize violations by impact (**Think Before Coding**).
3. **Fix highest-impact violations first** (critical > serious > moderate > minor) (**Simplicity First**).
4. **Surgical changes** — fix only the element/component with the violation; don't refactor adjacent code (**Surgical Changes**).
5. **Define done** as: zero critical/serious violations on automated scan + manual screen reader walkthrough passes (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note residual risks.

### Operating principles

1. **Think Before Coding** — Read the axe/Lighthouse report before touching code. Understand the user impact of each violation.
2. **Simplicity First** — Use semantic HTML first. Add ARIA only when semantic HTML is insufficient.
3. **Surgical Changes** — Touch only the component with the violation. Don't add `aria-label` everywhere preemptively.
4. **Goal-Driven Execution** — Done = zero critical/serious axe violations + screen reader walkthrough passes core flows.
5. **Semantic HTML beats ARIA** — A `<button>` is better than `<div role="button">`. Always prefer native elements.
6. **Test with real assistive tech** — Automated tools catch ~30–50% of issues. Screen reader testing is mandatory for high-traffic flows.
7. **Don't over-ARIA** — Adding wrong ARIA is worse than no ARIA. Redundant roles on semantic elements create confusion.

## Default recommendations by scenario

| Scenario | Default approach |
|----------|-----------------|
| First audit | Lighthouse in CI + axe DevTools browser extension |
| WCAG AA compliance | Fix all axe critical + serious; validate contrast with Scripts/check-color-contrast.js |
| Keyboard navigation | Skip links + visible :focus-visible + focus trap in modals |
| Screen reader support | NVDA+Firefox (Windows), VoiceOver+Safari (macOS/iOS) |
| Dynamic content | aria-live regions for status messages; aria-expanded for toggles |
| Legal compliance (EU) | EN 301 549 = WCAG 2.1 AA + additional functional criteria |

## Decision trees

Summary: violation type → ARIA pattern → testing approach → CI gate.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: using ARIA instead of semantic HTML, missing focus management on modals, empty alt text on informative images, aria-hidden on focusable elements, relying solely on automated tools.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### ARIA patterns (summary)

- Tabs, accordions, modals, carousels — each has a specific APG pattern.
- `aria-live` for dynamic content; `aria-atomic` controls announcement granularity.
- Focus trap is required for modal dialogs; restore focus on close.

Details: [references/aria-patterns.md](references/aria-patterns.md)

### Automated testing (summary)

- axe-core: most comprehensive rule set; integrates with Jest, Playwright, Cypress.
- Lighthouse: CI-friendly, produces scores; good for tracking over time.
- Pa11y: CLI tool; easy to add to CI without code changes.

Details: [references/automated-testing.md](references/automated-testing.md)

## Cross-skill handoffs

- **`design-system-pro`** — when contrast violations require updating color design tokens.
- **`react-pro`** — when implementing ARIA patterns in React hooks and components.
- **`testing-pro`** — when setting up axe-core in Jest/Playwright test suites.
- **`ai-design-pro`** — when AI-generated palettes need contrast validation.

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

1. **Violations found** — List by impact level (critical, serious, moderate, minor) with WCAG criterion.
2. **Fix** — Minimal code change targeting the root cause (semantic HTML or ARIA).
3. **Verification** — How to confirm the fix (axe re-scan, screen reader test command).
4. **Residual risks** — What automated tools won't catch; manual testing needed.

## Resources in this skill

| Topic | File |
|-------|------|
| ARIA widget patterns | [references/aria-patterns.md](references/aria-patterns.md) |
| Automated testing setup | [references/automated-testing.md](references/automated-testing.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Advanced techniques | [REFERENCE.md](REFERENCE.md) |
| Scripts | [Scripts/](Scripts/) |

## Quick example

**Input:** "Our modal dialog fails axe with 'aria-hidden-body' and keyboard focus leaves the modal."
- Add `aria-modal="true"` to the dialog; set `inert` on background content.
- Implement focus trap: capture Tab/Shift+Tab, keep focus within modal.
- On close: restore focus to the trigger button.
- **Verify:** `axe.run()` returns zero violations; NVDA can navigate modal content; Escape closes and returns focus.

**Input (tricky):** "We have 247 axe violations. Where do we start?"
- Filter to `impact: critical` and `impact: serious` — fix these first.
- Group by rule ID (e.g., `color-contrast` often accounts for 50%+ of violations).
- Use `Scripts/check-color-contrast.js` to batch-check all color pairs.
- **Verify:** Each sprint, critical violations = 0; track serious violations on a dashboard.

**Input (cross-skill):** "Build an accessible design system with color tokens and component library."
- **`a11y-design-pro`**: Define WCAG AA contrast ratios for all token pairs; ARIA for each component type.
- **`design-system-pro`**: Encode validated colors as tokens; document a11y usage per component.
- **`testing-pro`**: Add axe-core to Storybook; fail CI if any story has violations.
- **Verify:** All token pairs pass 4.5:1; all components pass axe in Storybook; design system docs include a11y notes.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; WCAG level and legal context confirmed (**Think Before Coding**)
- [ ] Automated scan run; violations categorized by impact before coding (**Think Before Coding**)
- [ ] Semantic HTML used first; ARIA added only where needed (**Simplicity First**)
- [ ] Only the violating component was modified (**Surgical Changes**)
- [ ] Zero critical/serious axe violations; screen reader walkthrough passes (**Goal-Driven Execution**)
- [ ] Color contrast ratios verified for all text/background pairs
- [ ] Keyboard navigation tested: Tab order logical, focus visible, Escape works
- [ ] Focus management correct: modals trap focus, focus restores on close
- [ ] `aria-live` regions announce dynamic changes to screen readers
- [ ] Residual risks called out: what automated tools won't catch
