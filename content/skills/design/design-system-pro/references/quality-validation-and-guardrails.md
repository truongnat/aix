# Quality validation and guardrails (anti-hallucination)

## Before specifying tokens or hex values

- [ ] **Brand not invented** — If user gave no palette, propose **neutral placeholders** labeled “example only.”
- [ ] **WCAG claims** — Contrast ratios need **both** foreground and background token IDs (or hex) — no “passes AA” without pair — **`foundations-baseline-and-data-ui.md`**.
- [ ] **Platform** stated — Web keyboard model ≠ native; don’t paste web-only advice for RN without caveat — **`platforms-web-app-desktop.md`**.

## Wrong-answer prevention

- **“Use Material 3 exactly”** without knowing stack — instead map **principles** and ask framework.
- **Fictional Figma variable paths** — Use generic names (`semantic/text/primary`) or ask user structure.

## Validation for AI/copilot UI

- Streaming layout must name **live region** strategy and **focus** management — **`ai-copilot-ui-patterns-deep-dive.md`** — do not omit assistive tech basics.

## Handoff clarity

- Separate **UX recommendation** from **implementation estimate** — defer LOC to **`react-pro`** / **`nextjs-pro`**.
