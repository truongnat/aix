# Token pipeline and source of truth

A design system is a **directed pipeline** from **intent** → **measurable UI** — break any link and drift wins.

## Layers (conceptual)

```text
Brand / UX principles
    → primitive tokens (hue steps, spacing unit, type ramp)
        → semantic tokens (bg.primary, fg.muted, border.subtle)
            → component recipes (button.primary.paddingX)
                → framework implementation (CSS vars, RN theme)
                    → rendered UI
```

**Single source** should be documented: often **tokens in Git** generated from Figma, or **Figma Variables** synced — not two competing spreadsheets — **`design-system-guidelines-and-consistency.md`**.

## Consistency model

- **Strict tokens** — Every visible style resolves to a token ID (good for governance).
- **Hybrid** — Primitives locked; semantic allows rare raw values with **ADR** — **`edge-cases.md`** governance note.

## Design ↔ engineering contract

| Artifact | Purpose |
|----------|---------|
| **Naming** — `color.text.secondary` identical in Figma & code | Reduces silent mismatch |
| **Version** — DS semver | Breaking rename needs codemod — **`failure-modes-detection-mitigation.md`** |

## Failure at pipeline boundaries

- **Semantic gap** — “muted” mapped to wrong hex in dark mode — verify **pairs** per surface — **`dark-mode-and-semantic-theming-deep-dive.md`**.
