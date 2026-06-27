# Design system — decision tree

## Density

- **Marketing** → Expressive type, generous whitespace.
- **Data app** → Compact density, alignment, numeric tabular figures.

## Theme

- **Dark** → Semantic surfaces + borders; never simple color invert.
- **Light only** → Still map semantic tokens for future dark.

## Platform

- **Web responsive** → Breakpoints, `prefers-reduced-motion`.
- **Native mobile** → **`mobile-design-pro`** before web patterns copied.

## Adoption model

- **Greenfield + small team** → Start with **headless primitives** + thin token layer; add components as you repeat patterns — **`decision-framework-and-trade-offs.md`**.
- **Legacy re-skin** → Tokenize **semantic** first; defer full component library until critical screens mapped.

## Copilot / AI-heavy product

- **Streaming + tool calls** → Read **`ai-copilot-ui-patterns-deep-dive.md`** before picking layout patterns.
