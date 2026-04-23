---
name: react-pro
description: |
  Production-grade React (web): component design, hooks and effect correctness, performance habits, UI/a11y, SSR/hydration — plus system model (render vs commit, reconciliation/keys, effects as external sync, concurrent rendering), failure modes (infinite updates, stale closures, hydration mismatch, list identity, unsafe JSX spread), decision trade-offs (derived vs stored state, server vs client state, controlled inputs, transitions, colocation vs store), and quality guardrails (React major accuracy, Rules of Hooks, no fabricated APIs).

  Use this skill when the user works on React, JSX/TSX, hooks (useState, useEffect, useMemo, useCallback, useRef, useReducer, useContext, useLayoutEffect), Server Components context (Next App Router), client boundaries, React Router / TanStack Router, TanStack Query, Zustand/Redux, forms (React Hook Form), testing (Vitest/Jest, RTL, Playwright), bundlers (Vite, webpack), or asks for review of effects, memoization, lists/keys, hydration, or bundle size.

  Combine with **`nextjs-pro`** for RSC and Next-specific data/cache, **`react-native-pro`** for mobile, **`testing-pro`** for RTL/CI, **`typescript-pro`** for TSX typing, **`security-pro`** for XSS/CSP, **`design-system-pro`** for tokens, and **`performance-tuning-pro`** when web vitals or backend dominate.

  Triggers: "React", "JSX", "TSX", "hooks", "useEffect", "infinite loop", "maximum update depth", "useMemo", "useCallback", "useRef", "memo", "React.memo", "re-render", "Strict Mode", "hydration", "hydration mismatch", "SSR", "RSC", "Server Component", "use client", "Next.js", "Vite", "React Router", "TanStack Query", "React Hook Form", "forwardRef", "lazy", "Suspense", "Error Boundary", "key prop", "Virtual DOM", "flushSync", "a11y", "ARIA", "semantic HTML".

metadata:
  short-description: React — render/effect model, hooks, hydration, failure modes, guardrails
  content-language: en
  domain: ui-framework
  level: professional
---

# React (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [React](https://react.dev/) docs for API truth; this skill encodes **rendering discipline**, **effect correctness**, **accessibility defaults**, and **SSR/hydration awareness** — not framework-specific routing or server cache (see **`nextjs-pro`**). Confirm **React major**, **meta-framework** (Vite/Next/Remix), and **SSR vs SPA** when known.

## Boundary

**`react-pro`** owns **React component model** (hooks, JSX, composition, web DOM semantics, client-side performance patterns, hydration on the web). **`nextjs-pro`** owns **Next.js App Router**, **RSC**, **`fetch` caching**, **middleware**, and **deployment-shaped** React. **`react-native-pro`** owns **React Native / Expo** platform APIs. **`testing-pro`** owns **test pyramid and CI** beyond component examples.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`nextjs-pro`** | RSC, `"use client"`, Server Actions, Next data/cache |
| **`react-native-pro`** | RN lists, native modules, EAS |
| **`testing-pro`** | RTL, Vitest/Jest, Playwright, CI |
| **`typescript-pro`** | TSX types, generics, strictness |
| **`security-pro`** | XSS, CSP, sanitization policy |
| **`design-system-pro`** | Tokens and design consistency |
| **`performance-tuning-pro`** | LCP/INP with CDN/API factors |

## When to use

- Components, hooks, context, forms, and data-fetching **boundaries** on the web.
- Effect correctness, memoization scope, list keys, stale closures, Strict Mode surprises.
- Hydration mismatches, concurrent rendering assumptions, Error Boundaries + Suspense.
- Semantic HTML, keyboard flows, modals, responsive and accessible UI.

## When not to use

- **Next.js-specific** routing, `fetch` revalidation, middleware — **`nextjs-pro`**.
- **React Native** screens and native build issues — **`react-native-pro`**.
- **Pure backend** API design — **`api-design-pro`** / **`nestjs-pro`** (pair for client consumption).

## Required inputs

- **`react` + `react-dom` major** (from `package.json` or user).
- **Bundler/framework** when SSR, code splitting, or RSC boundaries matter.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm React version, framework, and SSR/RSC context.
2. Apply summaries below; open `references/`; use **`react-rendering-and-effects-system-model.md`** when explaining render vs effects.
3. Respond with **Suggested response format**; include **hydration** and **effect failure modes** when relevant.

### Operating principles

1. **Effects synchronize** — Prefer handlers and derived state when sufficient — **`decision-tree.md`**.
2. **Minimize re-render surface** — Split components; memoize after measurement — **`decision-tree.md`**.
3. **Stable list keys** — Domain ids for mutable lists — **`components-and-jsx.md`**.
4. **Framework-aware** — RSC and `"use client"` change where hooks run — **`nextjs-pro`**.
5. **Accessibility by default** — Semantic HTML first; focus for modals — **`ui-ux-design.md`**.
6. **Observable async UI** — Loading, error, empty — **`ui-ux-design.md`**.

### UI / UX and semantics (summary)

Semantic HTML, focus, responsive, explicit async states — **`ui-ux-design.md`**.

Details: [references/ui-ux-design.md](references/ui-ux-design.md)

### Components and JSX craft (summary)

Composition, keys, `forwardRef`, controlled inputs — **`components-and-jsx.md`**.

Details: [references/components-and-jsx.md](references/components-and-jsx.md)

### Rendering and effects system model (summary)

Render vs commit, keys, effects, concurrency, SSR two-tree mental model — **`react-rendering-and-effects-system-model.md`**.

Details: [references/react-rendering-and-effects-system-model.md](references/react-rendering-and-effects-system-model.md)

### Tips and tricks (summary)

Deps, memoization, splitting, TanStack Query, forms — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Strict Mode, hydration, RSC boundaries, concurrent rendering, portals — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Derived vs stored state, transitions, stores vs colocation — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Conditional hooks, index keys, spread to DOM, effects for derived state — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`nextjs-pro`**, **`react-native-pro`**, **`testing-pro`**, **`security-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

React major, framework matrices — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — React major, framework (Vite/Next/…), CSR vs SSR/RSC, browser targets if relevant.
2. **Problem / goal** — Bug, review, or feature; hydration/effect/list/perf.
3. **System design** — Render vs effect vs external system; where state should live — **`react-rendering-and-effects-system-model.md`**.
4. **Decision reasoning** — Handler vs effect; memo vs split; server state library — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — TSX/hooks snippets aligned to documented APIs — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Readability vs memo; client duplicate vs server source of truth.
7. **Failure modes** — Max depth, hydration, list identity, unsafe spread — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Tests, a11y audit, hand off to **`nextjs-pro`** / **`security-pro`** / **`performance-tuning-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Rendering & effects model** | [references/react-rendering-and-effects-system-model.md](references/react-rendering-and-effects-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Components and JSX | [references/components-and-jsx.md](references/components-and-jsx.md) |
| UI / UX and semantics | [references/ui-ux-design.md](references/ui-ux-design.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Version notes | [references/versions.md](references/versions.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Hydration mismatch when rendering `new Date().toLocaleString()` on SSR page.  
**Expected output:** Full **Suggested response format** — server vs client first paint; `useEffect` + state or documented `suppressHydrationWarning` — **`edge-cases.md`**.

### 2 — Tricky (edge case)

**Input:** List reorders in place; selection state wrong after sort (index keys).  
**Expected output:** Stable domain keys; identity model — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** App Router page duplicates server data in `useState` on every navigation.  
**Expected output:** **`nextjs-pro`** for URL/RSC data; **`react-pro`** for minimal client UI state; avoid mirroring server truth — **`decision-framework-and-trade-offs.md`**.

## Checklist before calling the skill done

### Hooks and state

- [ ] Effects have correct deps and cleanup — **`quality-validation-and-guardrails.md`**.
- [ ] No derived state duplicated in `useState` — **`decision-tree.md`**.
- [ ] Hooks unconditional — **`anti-patterns.md`**.

### Lists and identity

- [ ] Stable keys for mutable lists — **`failure-modes-detection-mitigation.md`**.

### SSR and DOM

- [ ] No hydration warnings; browser APIs deferred — **`edge-cases.md`**.
- [ ] No unsafe `dangerouslySetInnerHTML` / blind DOM spread — **`failure-modes-detection-mitigation.md`**.

### UX and cross-skill

- [ ] Keyboard-accessible interactives; modal focus — **`ui-ux-design.md`**.
- [ ] Loading / error / empty for async UI — **`ui-ux-design.md`**.
- [ ] **`integration-map.md`** used when Next, RN, security, or perf outside React dominates.
