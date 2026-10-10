# Accessibility Decision Tree

## Step 1 — What type of task?

```
Task?
├── Audit an existing page/app    → Step 2: Audit
├── Implement a new component     → Step 3: Component
├── Fix a specific violation      → Step 4: Fix by type
└── Set up CI testing             → Step 5: CI
```

## Step 2 — Audit

```
Starting from scratch?
├── Yes → Run Lighthouse (CI) + axe DevTools (browser) on all key pages
│         → Categorise violations: critical / serious / moderate / minor
│         → Fix critical first
└── No  → Is there an existing axe report?
           ├── Yes → Filter impact=critical, group by ruleId
           └── No  → Run Scripts/aria-audit.js on HTML files
```

## Step 3 — Component implementation

```
Does a native HTML element do the job?
├── Yes → Use it (<button>, <input>, <select>, <details>, <dialog>)
└── No  → Look up the APG pattern: references/aria-patterns.md
          → Implement role + keyboard interaction + focus management
```

## Step 4 — Fix by violation type

```
Violation type?
├── color-contrast        → Scripts/check-color-contrast.js; adjust token value
├── image-alt             → Add descriptive alt; alt="" for decorative only
├── label                 → Add <label for="id"> or aria-label
├── aria-hidden-body      → Remove aria-hidden from body; use inert on bg
├── focus-trap (modal)    → references/aria-patterns.md → Modal Dialog
├── keyboard-navigation   → Verify Tab order matches visual; add skip links
├── button-name           → Add text content or aria-label to <button>
├── link-name             → Add text content or aria-label to <a>
├── heading-order         → Ensure h1→h2→h3 sequence, no skipped levels
└── aria-*                → Verify correct role; check APG pattern
```

## Step 5 — CI setup

```
Framework?
├── React (Jest)     → jest-axe (references/automated-testing.md)
├── E2E (Playwright) → @axe-core/playwright
├── Storybook        → @storybook/addon-a11y
├── No code changes  → pa11y-ci (CLI, works on any URL)
└── GitHub Actions   → Lighthouse CI (lhci)
```

## Step 6 — Screen reader testing

```
Platform?
├── Windows → NVDA + Firefox (free) or JAWS + Chrome (paid)
├── macOS   → VoiceOver + Safari (built-in; Cmd+F5 to enable)
├── iOS     → VoiceOver + Safari (Settings > Accessibility)
└── Android → TalkBack + Chrome (Settings > Accessibility)

What to test?
├── Can you reach all interactive elements with Tab?
├── Are form labels announced correctly?
├── Are error messages announced when they appear?
├── Can you complete core flows (login, purchase, search)?
└── Does focus return correctly after modal/drawer closes?
```
