# Quality validation and guardrails (TypeScript)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [No invented compiler flags](#no-invented-compiler-flags)
3. [Version truth](#version-truth)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Cite **`tsconfig`** keys and **TypeScript release** behavior from official docs or repo — **`versions.md`**.
- Do not claim “TS always does X” for edge `moduleResolution` without verifying project settings — **`failure-modes-detection-mitigation.md`**.

---

## No invented compiler flags

Only recommend **`compilerOptions`** that exist in the user’s TS version — verify in **`tsconfig.md`** / release notes.

---

## Version truth

- `@types/*` can lag **library** types — prefer package-shipped types when available — **`versions.md`**.

---

## Review checklist

- [ ] IO boundaries use `unknown` + validation — **`decision-tree.md`**.
- [ ] No silent `any`; escapes documented — **`anti-patterns.md`**.
- [ ] `tsconfig` changes justified for resolution/strictness — **`tsconfig.md`**.
- [ ] Cross-framework typing delegated — **`integration-map.md`**.
