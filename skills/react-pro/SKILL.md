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