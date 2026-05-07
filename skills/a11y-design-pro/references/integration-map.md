# Accessibility Integration Map

## Skill handoffs

```
a11y-design-pro
├── → design-system-pro
│     When: Color contrast violations require updating design tokens
│     Handoff: Failing color pairs + required replacement values
│
├── → react-pro / nextjs-pro
│     When: ARIA patterns need to be implemented as React components/hooks
│     Handoff: ARIA pattern spec from references/aria-patterns.md
│
├── → testing-pro
│     When: Setting up axe-core in Jest/Playwright/Cypress test suites
│     Handoff: axe config, rule tags, CI failure thresholds
│
├── → ai-design-pro
│     When: AI-generated color palettes must pass WCAG contrast validation
│     Handoff: Color pairs to check; use Scripts/check-color-contrast.js
│
└── → frontend-design-pro
      When: Accessibility fixes affect responsive layout or CSS
      Handoff: Focus style requirements; skip link positioning
```

## Toolchain integration

```
Design (Figma)
  ↓ Figma A11y plugin / Stark / Able — check contrast in design phase
Code (React)
  ↓ @axe-core/react — runtime violations in browser console (dev only)
Unit tests (Jest)
  ↓ jest-axe — automated per-component
E2E tests (Playwright)
  ↓ @axe-core/playwright — full page, real browser
Storybook
  ↓ @storybook/addon-a11y — per-story
CI (GitHub Actions)
  ↓ Lighthouse CI — score gates; pa11y-ci — page-level checks
```

## Compliance mapping

| Standard | Requirement | Region |
|----------|-------------|--------|
| ADA Title III | WCAG 2.1 AA | United States |
| Section 508 | WCAG 2.0 AA | US Federal |
| EN 301 549 | WCAG 2.1 AA + functional criteria | European Union |
| EAA 2025 | EN 301 549 (enforced June 2025) | EU (private sector) |
| AODA | WCAG 2.0 Level AA | Ontario, Canada |
| BS 8878 | WCAG 2.1 AA + process | United Kingdom |

## Typical remediation pipeline

```
Automated scan (axe/Lighthouse)
  ↓ Triage: critical → serious → moderate → minor
Fix critical (blocking: no keyboard access, missing labels)
  ↓ Re-scan: confirm zero critical
Fix serious (high impact: missing alt, low contrast)
  ↓ Scripts/check-color-contrast.js for all pairs
Manual screen reader test (NVDA + Firefox, VoiceOver + Safari)
  ↓ Test core flows: auth, forms, navigation, modals
Fix manual-only issues
  ↓ Document in accessibility statement
Set CI gate: axe violations = 0 (critical+serious) before merge
```
