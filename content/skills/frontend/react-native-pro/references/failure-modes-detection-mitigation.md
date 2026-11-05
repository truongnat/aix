# Failure modes — detection and mitigation (React Native)

## Contents

1. [Lists and rendering](#lists-and-rendering)
2. [Navigation and state](#navigation-and-state)
3. [Keyboard and layout](#keyboard-and-layout)
4. [Builds and updates](#builds-and-updates)
5. [Security-sensitive paths](#security-sensitive-paths)

---

## Lists and rendering

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Index as key** | Reorder bugs, wrong row state | Stable id keys — **`anti-patterns.md`** |
| **Fat `renderItem`** | JS thread spikes while scrolling | Memoized row; move work out of render — **`tips-and-tricks.md`** |
| **Huge images** | Memory warnings, decode stalls | Resize URI, `expo-image`, bounds — **`tips-and-tricks.md`** |

---

## Navigation and state

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Stale params after Fast Refresh** | Works after full reload only | Full reload when debugging nav — **`edge-cases.md`** |
| **Back stack wrong** | Android back exits app | `BackHandler` order + modal policy — **`edge-cases.md`** |
| **Deep link race** | Blank screen on cold start | Defer nav until tree ready — **`edge-cases.md`** |

---

## Keyboard and layout

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **`KeyboardAvoidingView` no-op** | Android only | `windowSoftInputMode`, behavior prop — **`edge-cases.md`** |
| **`onLayout` feedback loop** | Infinite layout / jank | Guard dimensions; debounce — **`react-native-runtime-and-threading-system-model.md`** |

---

## Builds and updates

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **OTA for native change** | Crash or silent failure | New binary + store build — **`edge-cases.md`** |
| **New Arch incompatibility** | Build or runtime native error | Pin arch flags; upgrade libs — **`versions.md`** |

---

## Security-sensitive paths

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Tokens in AsyncStorage** | Rooted device exposure | Secure storage / Keystore patterns — **`security-pro`** |
| **Deep link trust** | Open redirect in app | Validate host/path — **`security-pro`** |
