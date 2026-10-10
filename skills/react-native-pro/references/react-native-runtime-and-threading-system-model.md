# React Native — runtime, threading, and rendering model

## Contents

1. [JS thread vs native UI](#js-thread-vs-native-ui)
2. [Hermes and startup](#hermes-and-startup)
3. [Bridge, JSI, and New Architecture](#bridge-jsi-and-new-architecture)
4. [Lists and reconciliation](#lists-and-reconciliation)
5. [Why this matters for performance](#why-this-matters-for-performance)

Use official [React Native architecture](https://reactnative.dev/docs/the-new-architecture/landing-page) and [Expo docs](https://docs.expo.dev/) for flags and version matrix — confirm **SDK / RN major** in the repo.

---

## JS thread vs native UI

React runs on a **JavaScript thread**; native views update on **UI threads** (per platform). Heavy synchronous JS work **drops frames** (jank) even if native GPU is idle.

**Implication:** profile **JS frame time** (e.g. Flipper / perf monitor / Reanimated counters) separately from **layout** cost — **`tips-and-tricks.md`**.

---

## Hermes and startup

Hermes is the default JS engine on modern RN/Expo — smaller bytecode, faster startup vs JSC for many apps. Library compatibility and debugging tooling differ — verify per **Expo SDK** — **`versions.md`**.

---

## Bridge, JSI, and New Architecture

Historically the **bridge** serialized async calls between JS and native. **JSI** allows closer native interop; **Fabric** (renderer) and **TurboModules** are parts of the **New Architecture**.

**Implication:** some native modules require **explicit** New Arch support or compatibility shims — mismatches surface as **crashes or no-op native calls** — **`edge-cases.md`** (builds section).

---

## Lists and reconciliation

`FlatList` **virtualizes**: only a window of rows mounts. Unstable `keyExtractor`, inline `renderItem`, or heavy unmemoized rows force **reconciliation churn** and hurt scroll FPS — **`anti-patterns.md`**.

---

## Why this matters for performance

Optimizations should target the **measured** bottleneck:

| Symptom | Often first look |
|---------|-------------------|
| Scroll jank | List window, image decode, shadows |
| Tap delay | JS busy, bridge storm, heavy sync work |
| Slow startup | Bundle size, sync imports, native init |

Cross-reference **`performance-tuning-pro`** when backend or image CDN dominates latency.
