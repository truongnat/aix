# Integration map — react-pro

| Combined skill | Why | `react-pro` owns | Other skill owns |
|----------------|-----|------------------|------------------|
| **`nextjs-pro`** | RSC, routing, caching | Hooks, client UI, hydration in client trees | App Router, `fetch` cache, Server Actions, middleware |
| **`react-native-pro`** | Mobile RN/Expo | Shared hooks/mental model; web-only DOM stays here | Native modules, EAS, platform lists |
| **`testing-pro`** | RTL/Jest/Vitest | Component behavior, hooks testing strategy | CI wiring, pyramid, flakiness policy |
| **`security-pro`** | XSS, CSP | Safe JSX patterns, `dangerouslySetInnerHTML` avoidance | Threat model, headers, token policy |
| **`typescript-pro`** | TSX types | Prop/component typing ergonomics | `tsconfig`, advanced generics |
| **`design-system-pro`** | Consistency | Composition with tokens in React | Visual language, token source |
| **`performance-tuning-pro`** | INP / LCP / bundle | React-level fixes (memo, lists, transitions) | CDN, API latency, server profiling |

**Handoff:** When work is **framework-specific** (Next cache, RN bridge), lead with **`nextjs-pro`** / **`react-native-pro`** — **`react-pro`** stays on **component model, hooks, and web DOM semantics**.
