# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Tiny targets** | Dense mockups | Miss taps, rage taps | Min size + spacing — **`touch-layout-safe-areas-and-density.md`** |
| **CTA hidden by keyboard** | No avoidance | Checkout abandon | Sticky primary / scroll — **`touch-layout-safe-areas-and-density.md`** |
| **Gesture conflict** | Edge swipe vs OS back | Accidental navigation | Hit slop, explicit back — **`navigation-and-platform-ios-android.md`** |
| **Dynamic type overflow** | Fixed heights | Clipped labels | Flexible layouts — **`edge-cases.md`** |
| **Motion-only meaning** | Parallax hero | Users with reduce motion | Static alternative — **`edge-cases.md`** |
| **RTL breakage** | Hard-coded leading | Mirror bugs | Semantic start/end — **`edge-cases.md`** |
| **Fold under crease** | Primary CTA there | Bad ergonomics | Reflow — **`edge-cases.md`** |
| **False parity** | Same layout iOS/Android | Wrong back affordance | Platform-native patterns — **`anti-patterns.md`** |
| **Store rejection** | Web payment bypass | Review fail | IAP rules — **`edge-cases.md`** platform risk |
| **SR wrong order** | Visual vs DOM order | Confusing VO | Logical order — **`edge-cases.md`** |
