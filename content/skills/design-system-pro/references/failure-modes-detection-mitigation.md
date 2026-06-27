# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Token drift** | Designers paste hex; engineers hardcode | Visual regression; grep raw `#` | Lint for raw colors; token-only PR policy — **`design-system-guidelines-and-consistency.md`** |
| **a11y regression** | New component skips focus/contrast | axe/CI; manual keyboard | Checklist in PR; **`testing-pro`** |
| **Dark mode contrast fail** | Semantic mapping assumed light pairs | Contrast audit on **elevated** surfaces | Per-surface verification — **`dark-mode-and-semantic-theming-deep-dive.md`** |
| **Chart dishonesty** | Truncated axis, dual axis abuse | User distrust; audit | Domain chart rules — **`foundations-baseline-and-data-ui.md`** |
| **i18n overflow** | Fixed button width | Clipped labels in DE/RU | Min-width + ellipsis rules — **`edge-cases.md`** |
| **Assistive tech break** | Custom widget without roving tabindex | SR bug reports | Use primitives with tested patterns — **`a11y-responsive-and-web-typography.md`** |
| **Motion sickness** | Parallax ignores reduced-motion | User complaints | `prefers-reduced-motion` — **`a11y-responsive-and-web-typography.md`** |
| **CLS / layout thrash** | Web fonts / streaming AI layout | CWV drop | Font strategy; stable skeleton — **`web-performance-basics.md`**, **`ai-copilot-ui-patterns-deep-dive.md`** |
| **Rebrand half-done** | Logo updated, tokens not | Mixed eras on one page | Migration waves — **`token-pipeline-and-source-of-truth.md`** |
