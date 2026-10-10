# React Native — integration map

| Combined skill | Why | `react-native-pro` owns | Other skill owns |
|----------------|-----|---------------------------|------------------|
| **`react-pro`** | Shared React mental model | RN layout, native modules, EAS, lists | Web-only SSR/hydration |
| **`mobile-design-pro`** | Touch targets, motion, HIG/Material | RN implementation of spacing, gestures, a11y hooks | Brand/visual spec source |
| **`testing-pro`** | E2E and unit | Detox/Maestro constraints, RN test utils, snapshot flakiness | General pyramid |
| **`security-pro`** | Secure storage, deep links, WebView origin | Mobile threat framing, token storage patterns | Backend auth, API design |
| **`deployment-pro`** | Store release | EAS Submit / build numbers / phased rollout hints | Infra outside app stores |
| **`design-system-pro`** | Tokens | Applying tokens in RN styles | Defining global design system |
| **`performance-tuning-pro`** | End-to-end latency | When API/CDN dominates; complements RN profiling | Server query tuning |
| **`typescript-pro`** | Typed navigation, strict components | RN-specific typings (`StyleProp`, etc.) | Compiler-only policy |

**Handoff:** Native crashes, ABI, or signing issues → platform docs + minimal repro; **`deployment-pro`** for store console and rollout policy.
