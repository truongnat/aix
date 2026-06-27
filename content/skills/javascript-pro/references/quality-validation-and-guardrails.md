# Quality validation and guardrails (anti-hallucination)

## Language features

- [ ] **Stage / proposal** syntax — Confirm **shipping** in stated **engine list** (Node LTS, browserslist) — **`versions.md`**.
- [ ] Do **not** assume **Temporal** / **`import.meta`** are available everywhere without build targets.

## Examples

- [ ] Snippets match project **module** mode — ESM `import` vs CJS `require`.
- [ ] **`this`** demos show **call site** — avoid misleading standalone function examples — **`edge-cases.md`**.

## Security wording

- [ ] **`eval`** / **`new Function`** — Say “avoid” or sandbox context; never “safe enough” without threat model — **`security-pro`**.

## Browser vs Node

- [ ] **`fetch`/`Buffer`/path APIs** — Name runtime or guard with **`typeof`/polyfill**.
