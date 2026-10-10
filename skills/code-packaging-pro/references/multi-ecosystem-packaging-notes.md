# Multi-ecosystem packaging notes

This repo’s **`code-packaging-pro`** depth is **Python + Docker + GitHub Actions** — other ecosystems follow the **same artifact/registry discipline**.

## Node.js (npm/pnpm/yarn)

- **`package.json`** `version`, **`files`**, **`publishConfig`**; **`npm publish`** from CI with **OIDC trusted publishers** (npm) where enabled.
- Lockfile (`package-lock.json` / `pnpm-lock.yaml`) for **apps**; libraries may avoid locking consumers — team policy.

## Rust / Go

- **Crates.io** / **module proxy** — binary releases often via **GitHub Releases** + checksums; still **pin** toolchain in CI.

## Principle

**Same model** as **`artifact-build-and-registry-model.md`**: reproducible build → immutable artifact reference → promotion — ecosystem syntax differs — pair **`javascript-pro`**, **`cli-pro`** for bin contracts.
