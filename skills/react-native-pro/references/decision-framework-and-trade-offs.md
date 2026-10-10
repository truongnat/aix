# Decision framework and trade-offs (React Native)

## Contents

1. [Expo managed vs prebuild vs bare](#expo-managed-vs-prebuild-vs-bare)
2. [FlatList vs FlashList](#flatlist-vs-flashlist)
3. [In-app browser vs native WebView](#in-app-browser-vs-native-webview)
4. [Animation stacks](#animation-stacks)

Pair with **`decision-tree.md`** for quick branches.

---

## Expo managed vs prebuild vs bare

| Choice | Strength | Cost |
|--------|----------|------|
| **Managed Expo** | Fast iteration, EAS, modules | Custom native limited to ecosystem |
| **Prebuild** | Config plugins + some native escape hatches | More moving parts than pure managed |
| **Bare RN** | Full native control | You own Gradle/Xcode churn |

**Trade-off:** velocity vs native flexibility — verify **Expo SDK** capabilities before committing — **`versions.md`**.

---

## FlatList vs FlashList

| Prefer **FlatList** first | Reach for **FlashList** when |
|---------------------------|------------------------------|
| Moderate lists, tuned props | Very long feeds, measured jank after profiling |

**Trade-off:** FlashList adds dependency and layout constraints (`estimatedItemSize`) — do not adopt without **measurement** — **`tips-and-tricks.md`**.

---

## In-app browser vs native WebView

| Pattern | Fit |
|---------|-----|
| **Auth / SSO** | Often system browser or ASWebAuthenticationSession patterns for security — **`security-pro`** |
| **Embedded content** | WebView with tight origin allowlist |

**Trade-off:** WebView bundle and bridge traffic vs native screens — **`react-native-runtime-and-threading-system-model.md`**.

---

## Animation stacks

**Reanimated** runs much work off the JS thread when used correctly — still requires **version alignment** with RN and gesture-handler. **LayoutAnimation** is simpler but platform-specific and can conflict with Fabric in edge cases — test both OS.

**Trade-off:** power vs complexity and upgrade burden — **`versions.md`**.
