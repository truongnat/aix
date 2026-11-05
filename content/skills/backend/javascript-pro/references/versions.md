# JavaScript — versions and runtimes

## ECMAScript

- **Baseline:** Confirm target **ES year** vs **transpilation** (Babel/SWC/TypeScript `target`).
- **Modern features:** Top-level `await`, `import.meta`, `class` fields — verify Node/browser support matrix.

## Node.js

- Note **LTS** vs current; `fetch` (global), `AbortSignal.timeout`, native test runner availability differ by version.
- **`node:` protocol** imports recommended for stdlib clarity.

## Browsers

- Align with **browserslist** or documented minimums; test **Safari** gaps for modern APIs.

## Quick checks

- `process.version` / `navigator.userAgent` (avoid for feature detect — prefer capability checks).
- Lock **Volta** / **engines** in `package.json` for team consistency.
