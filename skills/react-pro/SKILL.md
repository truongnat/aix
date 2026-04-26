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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** React version, framework, and SSR/RSC context → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — State React version, SSR/RSC context, and framework before proposing any solution. Ask when unknown.
2. **Simplicity First** — Minimum hook or component that solves the problem; no premature abstraction (HOCs, context, portals) unless justified.
3. **Surgical Changes** — Only change the component or hook directly related to the request. No opportunistic refactors of unrelated effects or memoization.
4. **Goal-Driven Execution** — Done = no infinite update loops, no Rules of Hooks violations, no hydration mismatches in the changed subtree.
5. **Rules of Hooks always** — Verify call-count consistency first; hooks called conditionally or in loops are bugs regardless of the apparent behavior.
6. **Effect as external sync** — `useEffect` is for synchronizing with external systems; state derivation and event handling are not effects.
7. **Keys as stable identity** — List keys must be stable, unique, and content-derived — never array index for mutable lists.
8. **Accessibility by default** — Every interactive element gets role + keyboard + focus management; a11y is not a post-implementation task.

### Rendering and effects system model (summary)

Render phase (pure) → commit phase (DOM mutations) → layout effects → passive effects. Strict Mode double-invokes both to surface side effects in render. Concurrent rendering may suspend and resume; effects only run after commit.

Details: [references/react-rendering-and-effects-system-model.md](references/react-rendering-and-effects-system-model.md)

### Failure modes and mitigation (summary)

Infinite update loops, stale closures in effects, hydration mismatches, list identity (index keys), unsafe JSX spread — detection and fixes.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Derived vs stored state, server vs client state, controlled inputs, transitions, state colocation vs store.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

## Suggested response format

1. **Context** — React version, framework (Vite/Next/Remix), SSR vs SPA.
2. **System model** — Which render/effect phase applies; concurrent vs legacy mode relevance.
3. **Root issue** — What's broken and why (stale closure, Rules of Hooks violation, hydration mismatch, etc.).
4. **Solution** — Minimum code change; annotate why each hook or pattern is correct.
5. **Failure modes addressed** — What this fix prevents and what it doesn't.
6. **Residual risks** — Edge cases remaining (Strict Mode double-fire, RSC boundary, memoization trap).

## Resources in this skill

| Topic | File |
|-------|------|
| Rendering and effects system model | [references/react-rendering-and-effects-system-model.md](references/react-rendering-and-effects-system-model.md) |
| Components and JSX patterns | [references/components-and-jsx.md](references/components-and-jsx.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| UI/UX design integration | [references/ui-ux-design.md](references/ui-ux-design.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "My useEffect runs twice in development."
- React Strict Mode intentionally double-invokes effects to surface missing cleanup. This is expected in dev, not a bug.
- **Fix:** Add cleanup function if the effect has side effects; verify the behavior is idempotent.
- **Verify:** Effect cleanup correctly cancels subscriptions, timers, or requests.

**Input (tricky):** "I get a hydration mismatch — client renders different content than server."
- Root cause: Server and client render produce different HTML (Date.now(), Math.random(), window checks, missing `suppressHydrationWarning`).
- **Fix:** Guard browser-only code with `typeof window !== 'undefined'` inside `useEffect`, not in render. Use `suppressHydrationWarning` only for intentionally dynamic attributes (timestamps, ad slots).
- **Verify:** No `Warning: Text content did not match` in browser console.

**Input (cross-skill):** "Server Component fetches data but I need client interactivity."
- **Boundary:** Keep data fetching in the Server Component; pass data as props to a `"use client"` child that owns the interactive state.
- Pair **`nextjs-pro`** for RSC/Actions specifics, **`typescript-pro`** for typed props across the boundary.
- **Verify:** RSC payload in Network tab, no unnecessary client bundle increase.

## Checklist before calling the skill done

- [ ] React version and framework confirmed before writing any code (Think Before Coding)
- [ ] Rules of Hooks satisfied — no conditional or loop hook calls (Simplicity First)
- [ ] Only the requested component/hook modified — no unrelated refactors (Surgical Changes)
- [ ] No infinite update loop risk in the changed code (Goal-Driven Execution)
- [ ] Keys are stable and content-derived for any lists
- [ ] Hydration mismatch risk addressed for SSR/RSC code
- [ ] Accessibility preserved (roles, keyboard, focus) for interactive elements
- [ ] Stale closure sources identified and cleaned up in useEffect